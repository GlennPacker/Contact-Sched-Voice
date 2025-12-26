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
