import { dailyHoursValid, saveVisitToCalendar } from './calendarService.js';

import { createDeferredVisit } from './visitService.js';
import { generateRecurrenceDates } from './visitUtils.js';
import { supabase } from './supabaseClient';

async function collectDatedVisits(addresses = []) {
  const out = [];
  for (const addr of addresses || []) {
    for (const v of addr.visits || []) {
      if (v && v.visitDate) out.push(v);
    }
  }

  return out;
}

async function validateVisitsForAddresses(addresses = []) {
  const visits = await collectDatedVisits(addresses);
  for (const v of visits) {
    const ok = await dailyHoursValid(v, v.id);
    if (!ok) throw new Error(`Calendar conflict on ${v.visitDate}`);
  }
}
async function upsertAddress(contactId, addr) {
  if (addr && addr.id) {
    const { data, error } = await supabase.from('addresses').update({ address: addr.address, note: addr.note || null }).eq('id', addr.id).select('*').single();
    if (error) throw error;

    return data;
  }
  const { data, error } = await insertAddressRow(contactId, addr);
  if (error) throw error;

  return data;
}

async function processRecurrence(visitData, warnings) {
  if (!visitData || !visitData.visitDate) return;
  const { id, time, visitDate } = visitData;
  const dates = generateRecurrenceDates(visitData);
  if (!dates.length) return;
  for (const date of dates) {
    const ok = await dailyHoursValid({ visitDate: date, time }, id);
    if (!ok) {
      warnings.push(`Recurrence for visit on ${visitDate} stopped at ${date}`);
      await createDeferredVisit(visitData, date, warnings);
      break;
    }
    try {
      await saveVisitToCalendar({ id, visitDate: date, time });
    } catch (e) {
      warnings.push(`Failed to add recurrence for visit on ${visitDate} at ${date}: ${e && e.message ? e.message : e}`);
      continue;
    }
  }
}

async function upsertVisit(v, addressId, results) {
  const { visitDate, notes, isInside, isFlexilbe, time, visitTypeId } = v;

  if (v.id) {
    const dbRow = {
      addressId,
      earliestDate: v.earliestDate || null,
      isFlexilbe,
      isInside,
      notes,
      recurrence: v.recurrence || 'does not reoccur',
      time,
      visitDate: visitDate || null,
      visitTypeId: visitTypeId
    };

    const { data, error } = await supabase.from('visits').update(dbRow).eq('id', v.id).select('*').single();
    if (error) throw error;
    await supabase.from('calendars').delete().eq('visitId', data.id);
    await saveVisitToCalendar(data);
    await processRecurrence(data, results.warnings);

    return data;
  }
  const { data, error } = await insertVisitRow(addressId, v);
  if (error) throw error;
  await saveVisitToCalendar(data);
  await processRecurrence(data, results.warnings);

  return data;
}

async function insertAddressesAndVisits(contactId, addresses = [], results) {
  for (const addr of addresses || []) {
    const aData = await upsertAddress(contactId, addr);
    results.addresses.push(aData);

    if (aData.id) {
      const { data: existingVisits } = await supabase.from('visits').select('id').eq('addressId', aData.id);
      const existingIds = (existingVisits || []).map(v => v.id);
      const incomingIds = (addr.visits || []).map(v => v.id).filter(x => !!x);
      const toDelete = existingIds.filter(id => !incomingIds.includes(id));
      if (toDelete.length) {
        await supabase.from('calendars').delete().in('visitId', toDelete);
        await supabase.from('visits').delete().in('id', toDelete);
      }
    }

    for (const v of addr.visits || []) {
      const vData = await upsertVisit(v, aData.id, results);
      results.visits.push(vData);
    }
  }
}

export function mapContactTypes(contactTypes) {
  const types = {};
  contactTypes.forEach(ct => {
    const hasMetadata = ![undefined, ""].includes(ct.metadata);
    
    if (ct.contactType === 'facebookGlenn' && hasMetadata) {
      types.facebookGlenn = true;
      types.facebookglennmetadata = ct.metadata;
    } else if (ct.contactType === 'facebookHandyman' && hasMetadata) {
      types.facebookHandyman = true;
      types.facebookhandymanmetadata = ct.metadata;
    } else {
      types[ct.contactType] = hasMetadata ? ct.metadata : true;
    }
  });

  return types;
}

export function buildContactRow(contact) {
  const { addresses, contactTypes, ...rest } = contact || {};

  return {
    ...rest,
    ...mapContactTypes(contactTypes),
  };
}

export async function insertContactRow(contactRow) {
  const { data, error } = await supabase.from('contacts').insert([contactRow]).select('*').single();

  return { data, error };
}

export async function insertAddressRow(contactId, addr) {
  const dbRow = { contactId, address: addr.address, note: addr.note || null };
  const { data, error } = await supabase.from('addresses').insert([dbRow]).select('*').single();

  return { data, error };
}

export async function insertVisitRow(addressId, visit) {
  const dbRow = {
    addressId,
    visitDate: visit.visitDate || null,
    notes: visit.notes,
    isInside: visit.isInside,
    isFlexilbe: visit.isFlexilbe,
    time: visit.time,
    recurrence: visit.recurrence || 'does not reoccur',
    earliestDate: visit.earliestDate || null,
    visitTypeId: visit.visitTypeId,
  };
  const { data, error } = await supabase.from('visits').insert([dbRow]).select('*').single();

  return { data, error };
}

export async function addContact(contact) {
  const contactRow = buildContactRow(contact);
  const { data: createdContact, error: contactErr } = await insertContactRow(contactRow);
  if (contactErr) return { data: null, error: contactErr };

  const results = { contact: createdContact, addresses: [], visits: [], warnings: [] };

  try {
    await validateVisitsForAddresses(contact.addresses || []);
    results.warnings = [];
    await insertAddressesAndVisits(createdContact.id, contact.addresses || [], results);
  } catch (err) {
    return { data: null, error: err };
  }

  return { data: results, error: null };
}

export async function listContacts({ limit = 25 } = {}) {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, name, addresses(address)')
    .order('name', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

export async function searchContacts({ name = '', address = '', limit = 1000 } = {}) {
  const nameTerm = String(name || '').trim().toLowerCase();
  const addressTerm = String(address || '').trim().toLowerCase();

  const data = await listContacts({ limit });
  const list = Array.isArray(data) ? data : [];

  if (!nameTerm && !addressTerm) return list;

  const scored = list.map(c => {
    const nameVal = (c.name || '').toLowerCase();
    const matchName = nameTerm ? nameVal.indexOf(nameTerm) !== -1 : false;

    const addresses = Array.isArray(c.addresses) ? c.addresses : [];
    const matchAddress = addressTerm
      ? addresses.some(a => (a && a.address ? ('' + a.address).toLowerCase().indexOf(addressTerm) !== -1 : false))
      : false;

    const score = (matchName ? 1 : 0) + (matchAddress ? 1 : 0);

    return { contact: c, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      return (a.contact.name || '').localeCompare(b.contact.name || '');
    })
    .map(s => s.contact);
}

export async function getContact(contactId) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*, facebookglennmetadata, facebookhandymanmetadata, addresses(id, address, note, visits(id, visitDate, earliestDate, notes, isInside, isFlexilbe, time, recurrence, visitTypeId))')
    .eq('id', contactId)
    .single();

  if (error) throw error;

  const row = data || {};
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
      const keys = ['facebookGlenn', 'facebookHandyman', 'whatsapp', 'email', 'phone'];
      const out = {};
      keys.forEach(k => {
        const metadataKey = k.toLowerCase() + 'metadata';
        const metadata = row[metadataKey] || (typeof row[k] === 'string' ? row[k] : '');
        if (row[k]) {
          out[k] = { selected: true, metadata };
        } else {
          out[k] = { selected: false, metadata: '' };
        }
      });
      return out;
    })(),
    addresses: (row.addresses || []).map(a => ({
      id: a.id,
      address: a.address,
      note: a.note || '',
      visits: (a.visits || []).map(v => ({
        id: v.id,
        visitDate: v.visitDate || '',
        earliestDate: v.earliestDate || null,
        recurrence: v.recurrence || 'does not reoccur',
        notes: v.notes || '',
        isInside: v.isInside || false,
        isFlexilbe: v.isFlexilbe || false,
        time: v.time || '',
        visitTypeId: v.visitTypeId,
      }))
    }))
  };

  return contact;
}

export async function updateContact(contactId, contact) {
  const contactRow = buildContactRow(contact);

  const { data: updatedContact, error: updateErr } = await supabase
    .from('contacts')
    .update(contactRow)
    .eq('id', contactId)
    .select('*')
    .single();

  if (updateErr) return { data: null, error: updateErr };

  const results = { contact: updatedContact, addresses: [], visits: [], warnings: [] };

  const { data: existingAddrs } = await supabase.from('addresses').select('id').eq('contactId', contactId);
  const existingIds = (existingAddrs || []).map(a => a.id);
  const incomingAddrIds = (contact.addresses || []).map(a => a.id).filter(x => x);
  const toDelete = existingIds.filter(id => !incomingAddrIds.includes(id));
  if (toDelete.length) {
    const { data: visitsToDelete } = await supabase.from('visits').select('id').in('addressId', toDelete);
    const visitIdsToDelete = (visitsToDelete || []).map(v => v.id);
    if (visitIdsToDelete.length) {
      await supabase.from('calendars').delete().in('visitId', visitIdsToDelete);
      await supabase.from('visits').delete().in('id', visitIdsToDelete);
    }
    await supabase.from('addresses').delete().in('id', toDelete);
  }
  try {
    await validateVisitsForAddresses(contact.addresses || []);
    await insertAddressesAndVisits(updatedContact.id, contact.addresses || [], results);
  } catch (err) {
    return { data: null, error: err };
  }

  return { data: results, error: null };
}

export async function getContactsByIds(ids = []) {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .in('id', ids);
  if (error) throw error;

  return Array.isArray(data) ? data : [];
}

