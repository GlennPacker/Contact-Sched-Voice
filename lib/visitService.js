import { supabase } from './supabaseClient'

export async function listVisits({ fromDate, limit = 25, order = 'asc' } = {}) {
  let q = supabase
    .from('calendars')
    .select('date, visitId, visits!inner(id, addressId, visitDate, time, notes, isInside, recurrence)')

  if (fromDate) {
    q = q.gte('date', fromDate)
  }

  q = q.order('date', { ascending: order === 'asc' }).limit(limit)

  const { data, error } = await q
  if (error) throw error

  if (!Array.isArray(data)) return []

  return data.map((row) => {
    const v = row.visits || {}
    return {
      id: v.id,
      addressId: v.addressId,
      visitDate: row.date,
      time: v.time,
      notes: v.notes,
      isInside: v.isInside,
      recurrence: v.recurrence,
      visitId: row.visitId,
    }
  })
}
