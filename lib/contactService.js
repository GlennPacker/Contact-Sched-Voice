import { supabase } from './supabaseClient'

export function mapContactTypes(contactTypes) {
  const types = {};
  contactTypes.forEach((ct) => {
    types[ct.contactType] = ct.metadata !== undefined ? ct.metadata : true
  })
  return types
}

export function buildContactRow(contact) {
  const { addresses, contactTypes, ...rest } = contact || {}
  return {
    ...rest,
    ...mapContactTypes(contactTypes),
  }
}

export async function insertContactRow(contactRow) {
  const { data, error } = await supabase.from('contacts').insert([contactRow]).select('*').single()
  return { data, error }
}

export async function insertAddressRow(contactId, addr) {
  const dbRow = { contactId, address: addr.address }
  const { data, error } = await supabase.from('addresses').insert([dbRow]).select('*').single()
  return { data, error }
}

export async function insertVisitRow(addressId, visit) {
  const dbRow = {
    addressId,
    visitDate: visit.date,
    notes: visit.notes,
    isInside: visit.isInside,
    isFlexilbe: visit.isFlexilbe,
  }
  const { data, error } = await supabase.from('visits').insert([dbRow]).select('*').single()
  return { data, error }
}

export async function addContact(contact) {
  const contactRow = buildContactRow(contact)
  const { data: createdContact, error: contactErr } = await insertContactRow(contactRow)
  if (contactErr) return { data: null, error: contactErr }

  const results = { contact: createdContact, addresses: [], visits: [] }

  for (const addr of contact.addresses) {
    const { data: aData, error: aErr } = await insertAddressRow(createdContact.id, addr)
    if (aErr) return { data: results, error: aErr }
    results.addresses.push(aData)

    for (const v of addr.visits) {
      const { data: vData, error: vErr } = await insertVisitRow(aData.id, v)
      if (vErr) return { data: results, error: vErr }
      results.visits.push(vData)
    }
  }

  return { data: results, error: null }
}

export default addContact

export async function listContacts({ limit = 25 } = {}) {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, name, addresses(address)')
    .order('id', { ascending: false })
    .limit(limit)

  if (error) throw error

  return data || [];
}

export async function searchContacts({ name = '', address = '', limit = 1000 } = {}) {
  const nameTerm = String(name || '').trim().toLowerCase()
  const addressTerm = String(address || '').trim().toLowerCase()

  const data = await listContacts({ limit })
  const list = Array.isArray(data) ? data : []

  if (!nameTerm && !addressTerm) return list

  const scored = list.map((c) => {
    const nameVal = (c.name || '').toLowerCase()
    const matchName = nameTerm ? nameVal.indexOf(nameTerm) !== -1 : false

    const addresses = Array.isArray(c.addresses) ? c.addresses : []
    const matchAddress = addressTerm
      ? addresses.some((a) => (a && a.address ? ('' + a.address).toLowerCase().indexOf(addressTerm) !== -1 : false))
      : false

    const score = (matchName ? 1 : 0) + (matchAddress ? 1 : 0)
    return { contact: c, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (a.contact.name || '').localeCompare(b.contact.name || '')
    })
    .map((s) => s.contact)
}

export async function getContact(contactId) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*, addresses(id, address, visits(id, visitDate, notes, isInside, isFlexilbe))')
    .eq('id', contactId)
    .single()

  if (error) throw error

  const row = data || {}
  const contact = {
    id: row.id,
    name: row.name,
    rateFullDay: row.rateFullDay,
    rateHalfDay: row.rateHalfDay,
    rateTwoHour: row.rateTwoHour,
    rateHour: row.rateHour,
    rateJob: row.rateJob,
    priceReviewDate: row.priceReviewDate,
    contactTypes: (() => {
      const keys = ['facebookGlenn', 'faceBookHandyman', 'whatsapp', 'email']
      const out = {}
      keys.forEach(k => {
        if (row[k]) {
          out[k] = { selected: true, metadata: typeof row[k] === 'string' ? row[k] : '' }
        } else {
          out[k] = { selected: false, metadata: '' }
        }
      })
      return out
    })(),
    addresses: (row.addresses || []).map(a => ({
      id: a.id,
      address: a.address,
      visits: (a.visits || []).map(v => ({
        id: v.id,
        date: v.visitDate || '',
        note: v.notes || '',
        isInside: v.isInside || false,
        isFlexilbe: v.isFlexilbe || false,
      }))
    }))
  }

  return contact
}

export async function updateContact(contactId, contact) {
  const contactRow = buildContactRow(contact)

  const { data: updatedContact, error: updateErr } = await supabase
    .from('contacts')
    .update(contactRow)
    .eq('id', contactId)
    .select('*')
    .single()

  if (updateErr) return { data: null, error: updateErr }

  const results = { contact: updatedContact, addresses: [], visits: [] }

  const { data: existingAddrs } = await supabase.from('addresses').select('id').eq('contactId', contactId)
  const existingIds = (existingAddrs || []).map(a => a.id)
  if (existingIds.length) {
    await supabase.from('visits').delete().in('addressId', existingIds)
    await supabase.from('addresses').delete().in('id', existingIds)
  }

  for (const addr of contact.addresses || []) {
    const { data: aData, error: aErr } = await insertAddressRow(updatedContact.id, addr)
    if (aErr) return { data: results, error: aErr }
    results.addresses.push(aData)

    for (const v of addr.visits || []) {
      const { data: vData, error: vErr } = await insertVisitRow(aData.id, v)
      if (vErr) return { data: results, error: vErr }
      results.visits.push(vData)
    }
  }

  return { data: results, error: null }
}
