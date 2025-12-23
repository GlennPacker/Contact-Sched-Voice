import { supabase } from './supabaseClient'

export async function addContact(contact) {
  const { data, error } = await supabase.from('contacts').insert([contact]);
  return { data, error };
}

export default addContact
