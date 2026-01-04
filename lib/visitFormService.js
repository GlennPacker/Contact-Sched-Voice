function getTomorrowMinDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function getCutoffDate(days = 14) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString().split('T')[0];
}

function sortVisitsByDateDesc(visits = []) {
  return [...visits].sort((a, b) => {
    if (!a?.visitDate && !b?.visitDate) return 0;
    if (!a?.visitDate) return 1;
    if (!b?.visitDate) return -1;
    return b.visitDate.localeCompare(a.visitDate);
  });
}

function makeNewVisitFromMostRecent(fields = []) {
  if (!fields.length) return { visitDate: null };
  const sorted = sortVisitsByDateDesc(fields);
  const mostRecent = sorted[0] || {};
  return {
    visitDate: null,
    notes: mostRecent.notes || '',
    recurrence: mostRecent.recurrence || 'does not reoccur',
    time: mostRecent.time || '',
    days: mostRecent.days || '',
    isInside: mostRecent.isInside || false,
    isFlexilbe: mostRecent.isFlexilbe || false,
  };
}


function defaultCollapsedFor(fieldsLength) {
  return Array.from({ length: fieldsLength || 1 }, (_, i) => i > 0)
}

function filterVisibleVisits({ fields = [], watchedVisits = [], cutoffDays = 14 } = {}) {
  const cutoffStr = getCutoffDate(cutoffDays)
  return fields
    .map((_, i) => i)
    .filter(i => !((watchedVisits?.[i]?.visitDate ?? fields[i]?.visitDate) < cutoffStr))
}

function sortArrayByDate({ fields = [], watchedVisits = [], positions = [] } = {}) {
  return [...positions].sort((pa, pb) => {
    const a = watchedVisits?.[pa] || fields[pa] || {}
    const b = watchedVisits?.[pb] || fields[pb] || {}
    const aDate = a.visitDate
    const bDate = b.visitDate
    if (aDate === bDate) return 0
    if (!aDate) return -1
    if (!bDate) return 1
    return aDate.localeCompare(bDate)
  })
}

function orderVisits(opts = {}) {
  const filtered = filterVisibleVisits(opts)
  return sortArrayByDate({ ...opts, positions: filtered })
}

export {
  getTomorrowMinDate,
  getCutoffDate,
  sortVisitsByDateDesc,
  makeNewVisitFromMostRecent,
  defaultCollapsedFor,
  filterVisibleVisits,
  sortArrayByDate,
  orderVisits,
};
