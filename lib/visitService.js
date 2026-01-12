import { supabase } from './supabaseClient';

export async function listVisits({ fromDate, limit = 25, order = 'asc' } = {}) {
  let q = supabase
    .from('calendars')
    .select('date, visitId, visits!inner(id, addressId, visitDate, time, notes, isInside, recurrence)');

  if (fromDate) {
    q = q.gte('date', fromDate);
  }

  q = q.order('date', { ascending: order === 'asc' }).limit(limit);

  const { data, error } = await q;
  if (error) throw error;

  if (!Array.isArray(data)) return [];

  return data.map(row => {
    const v = row.visits || {};

    return {
      id: v.id,
      addressId: v.addressId,
      visitDate: row.date,
      time: v.time,
      notes: v.notes,
      isInside: v.isInside,
      recurrence: v.recurrence,
      visitId: row.visitId,
    };
  });
}

export async function listUnscheduledVisits() {
  const { data, error } = await supabase
    .from('visits')
    .select('id, addressId, visitDate, time, notes, isInside, recurrence, earliestDate')
    .is('visitDate', null);

  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return data.map(v => ({
    id: v.id,
    addressId: v.addressId,
    visitDate: v.visitDate,
    time: v.time,
    notes: v.notes,
    isInside: v.isInside,
    recurrence: v.recurrence,
    earliestDate: v.earliestDate,
  }));
}

export async function createDeferredVisit(visitData, date, warnings) {
  const deferred = {
    addressId: visitData.addressId,
    visitDate: null,
    earliestDate: date,
    notes: visitData.notes,
    isInside: visitData.isInside,
    isFlexilbe: visitData.isFlexilbe,
    time: visitData.time,
    recurrence: visitData.recurrence,
  };
  try {
    const { data: dData, error: dErr } = await supabase.from('visits').insert([deferred]).select('*').single();
    if (dErr) {
      warnings.push(`Failed to create deferred visit for recurrence starting ${date}`);

      return null;
    }
    warnings.push(`Deferred visit created (id=${dData.id}) with earliestDate=${date}`);

    return dData;
  } catch (e) {
    warnings.push(`Failed to create deferred visit for recurrence starting ${date}`);

    return null;
  }
}

export async function deleteVisit(visitId, visitDate) {
  const { error } = await supabase.from('visits').delete().match({ id: visitId, visitDate, recurrence: 'does not reoccur' });
  if (error) throw new Error(error.message || 'Failed to delete visit');
}

export async function deleteById(ids) {
  const arr = Array.isArray(ids) ? ids : [ids];

  const { error } = await supabase.from('visits').delete().in('id', arr);
  if (error) throw new Error(error.message || 'Failed to delete visits');
}

export async function getById(id) {
  const { data, error } = await supabase.from('visits').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

// Client-side API wrappers — components should call these instead of using fetch directly
export async function cancelVisitApi(visitId, visitDate) {
  const res = await fetch('/api/calendar/cancelVisit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitId, visitDate }),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || 'Failed to cancel visit');

  return payload;
}

export async function cancelFutureVisitsApi(visitId, fromDate) {
  const res = await fetch('/api/calendar/cancelVisits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitId, fromDate }),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.error || 'Failed to delete future visits');
  }
}
