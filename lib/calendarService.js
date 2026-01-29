export async function getNextVisitsDayWithVisits() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: nextDayRows, error: nextDayError } = await supabase
    .from('calendars')
    .select('date')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(1);
  if (nextDayError) throw nextDayError;
  const nextDate = nextDayRows?.[0]?.date;

  if (!nextDate) return { date: null, visits: [] };
  const { data: visits, error: visitsError } = await supabase
    .from('calendars')
    .select(`
      id,
      date,
      time,
      visitId,
      visits!calendars_visitId_fkey(
        time,
        notes,
        isInside,
        isFlexilbe,
        recurrence,
        earliestDate,
        addressId,
        visitTypeId,
        addresses:addressId(
          address,
          contacts(*)
        )
      )
    `)
    .eq('date', nextDate);
  if (visitsError) throw visitsError;
  return { date: nextDate, visits };
}
export async function updateById(id, updates) {
  const { data, error } = await supabase
    .from('calendars')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
}
import { supabase } from './supabaseClient';

const HOURS = { 'full day': 7, '1/2 day': 3.5, '2 hours': 2 };

export async function updateCalendarDate(calendarId, newDate) {
  await updateById(calendarId, { date: newDate });
}

export async function updateFutureCalendarDates(visitId, daysDiff, originalDate) {
  const data = await listAllByVisitId(visitId, originalDate);
  function buildUpdatePromise(v) {
    const oldDateObj = new Date(v.date);
    oldDateObj.setDate(oldDateObj.getDate() + daysDiff);
    const newDate = oldDateObj.toISOString().split('T')[0];
    return updateById(v.id, { date: newDate });
  }
  await Promise.all(data.map(buildUpdatePromise));
}

export async function hasFutureDatesApi(visitId, visitDate) {
  const res = await fetch('/api/calendar/hasFutureDates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitId, visitDate }),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || 'Failed to check future dates');

  return payload;
}

export async function fetchCalendarRows(date) {
  const { data, error } = await supabase.from('calendars').select('visitId,date,time').eq('date', date);
  if (error) throw error;

  return data;
}

export function totalHours(calRows = [], currentVisitId) {
  let total = 0;
  calRows.forEach(c => {
    if (c.visitId === currentVisitId) return;
    total += HOURS[c.time];
  });

  return total;
}

export async function dailyHoursValid(visit = {}, currentVisitId = null) {
  const date = visit.visitDate;
  const incoming = HOURS[visit.time];
  const calRows = await fetchCalendarRows(date);
  const existingHours = totalHours(calRows, currentVisitId);

  return existingHours + incoming <= 9;
}

export async function saveVisitToCalendar(visitRow = {}) {
  if (!visitRow.visitDate) return null;
  const dbRow = { visitId: visitRow.id || null, date: visitRow.visitDate, time: visitRow.time };
  const { data, error } = await supabase.from('calendars').insert([dbRow]).select('*').single();
  if (error) throw new Error(error.message || `Failed to insert calendar row for: ${visitRow.visitDate}`);

  return data;
}

export async function deleteCalendarRow(visitId, date) {
  const { error } = await supabase.from('calendars').delete().match({ visitId, date });
  if (error) throw new Error(error.message || 'Failed to delete calendar row');
}

export async function deleteById(ids) {
  const arr = Array.isArray(ids) ? ids : [ids];

  const { error } = await supabase.from('calendars').delete().in('visitId', arr);
  if (error) throw new Error(error.message || 'Failed to delete calendar rows');
}

export async function listAllByVisitId(visitId, fromDate) {
  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('visitId', visitId)
    .gte('date', fromDate);
  if (error) throw error;
  return data;
}

export async function moveVisitApi({ calendarId, visitId, newDate, moveFuture, originalDate }) {
  const res = await fetch('/api/calendar/moveVisit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calendarId, visitId, newDate, moveFuture, originalDate })
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error || 'Failed to move visit');
  }
  return res.json();
}
