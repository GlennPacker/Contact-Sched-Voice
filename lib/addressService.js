import { supabase } from './supabaseClient';

export async function add(contactId, address) {
  const dbRow = { contactId, address };
  const { data, error } = await supabase.from('addresses').insert([dbRow]).select('*').single();
  if (error) throw error;

  return data;
}

export async function get(id) {
  const { data, error } = await supabase.from('addresses').select('id, address, contactId').eq('id', id).single();
  if (error) throw error;

  return data || null;
}

export async function update(id, address) {
  const { data, error } = await supabase.from('addresses').update({ address }).eq('id', id).select('*').single();
  if (error) throw error;

  return data;
}

export async function list({ contactId } = {}) {
  let q = supabase.from('addresses').select('id, address, contactId');
  if (contactId) q = q.eq('contactId', contactId);
  const { data, error } = await q;
  if (error) throw error;

  return Array.isArray(data) ? data : [];
}

export async function getById(ids) {
  if (Array.isArray(ids)) {
    if (!ids.length) return [];
    const { data, error } = await supabase.from('addresses').select('id, address, contactId').in('id', ids);
    if (error) throw error;

    return Array.isArray(data) ? data : [];
  }

  const { data, error } = await supabase.from('addresses').select('id, address, contactId').eq('id', ids).single();
  if (error) throw error;
  return data;
}

export async function listFutureById(addressIds, fromDate) {
  const ids = Array.isArray(addressIds) ? addressIds : [addressIds];

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .in('addressId', ids)
    .gte('visitDate', fromDate);

  if (error) throw error;
  return data;
}



