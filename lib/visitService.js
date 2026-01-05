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
