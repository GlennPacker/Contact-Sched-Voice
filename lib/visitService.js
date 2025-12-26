import { supabase } from './supabaseClient'

export async function listVisits({ fromDate, limit = 25, order = 'asc' } = {}) {
  let q = supabase
    .from('visits')
    .select('id, addressId, visitDate, time, notes, isInside')

  if (fromDate) {
    q = q.gte('visitDate', fromDate)
  }

  q = q.order('visitDate', { ascending: order === 'asc' }).limit(limit)

  const { data, error } = await q
  if (error) throw error
  return Array.isArray(data) ? data : []
}
