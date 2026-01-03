import { supabase } from './supabaseClient'

export async function listVisits({ fromDate, limit = 25, order = 'asc' } = {}) {
  // Query upcoming entries from the calendars table and include the related visit
  // Use the calendar `date` as the effective `visitDate` for upcoming listings
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

  // Map calendar rows to the shape previous callers expect but use the calendar date
  return data.map((row) => {
    const v = row.visits || {}
    return {
      id: v.id,
      addressId: v.addressId,
      // Use calendar date as the effective visitDate for upcoming lists
      visitDate: row.date,
      time: v.time,
      notes: v.notes,
      isInside: v.isInside,
      recurrence: v.recurrence,
      visitId: row.visitId,
    }
  })
}
