import { supabase } from './supabaseClient';

export async function getAddressesByIds(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const { data, error } = await supabase
    .from('addresses')
    .select('id, address, contactId')
    .in('id', ids);
  if (error) throw error;

  return Array.isArray(data) ? data : [];
}

export async function getAllAddresses() {
  const { data, error } = await supabase
    .from('addresses')
    .select('id, address, contactId');
  if (error) throw error;

  return Array.isArray(data) ? data : [];
}
