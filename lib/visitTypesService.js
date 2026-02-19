import { supabase } from './supabaseClient';

export async function getVisitTypes() {
  const { data, error } = await supabase
    .from('visittypes')
    .select('id, label')
    .order('label', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(vt => ({ id: vt.id, name: vt.label }));
}
