import { supabase } from './supabaseClient';

export async function getVisitTypes() {
  const { data, error } = await supabase
    .from('visittypes')
    .select('id, label')
    .order('label', { ascending: true });
  if (error) throw new Error(error.message);
  // Map label to name for compatibility
  return (data || []).map(vt => ({ id: vt.id, name: vt.label }));
}
