import { supabase } from './supabaseClient'

const HOURS = { 'full day': 7, '1/2 day': 3.5, '2 hours': 2 }

export async function fetchCalendarRows(date) {
  const { data, error } = await supabase.from('calendars').select('visitId,date,time').eq('date', date)
  if (error) throw error
  return data || []
}


export function totalHours(calRows = [], currentVisitId) {
  let total = 0
  calRows.forEach(c => {
    if (c.visitId === currentVisitId) return
    total += HOURS[c.time]
  })
  return total
}

export async function dailyHoursValid(visit = {}, currentVisitId = null) {
  if (!visit || !visit.visitDate) return true
  const date = visit.visitDate
  const incoming = HOURS[visit.time]
  const calRows = await fetchCalendarRows(date)
  const existingHours = totalHours(calRows, currentVisitId)
  return existingHours + incoming <= 9
}

export async function saveVisitToCalendar(visitRow = {}) {
  const dbRow = { visitId: visitRow.id || null, date: visitRow.visitDate, time: visitRow.time }
  const { data, error } = await supabase.from('calendars').insert([dbRow]).select('*').single()
  if (error) throw new Error(error.message || `Failed to insert calendar row for: ${visitRow.visitDate}`)
  return data
}
