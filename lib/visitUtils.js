export function calcStart(year, month, day, time) {
  function lastSunday(y, m) {
    const d = new Date(Date.UTC(y, m, 31));
    d.setUTCDate(31 - d.getUTCDay());
    return d;
  }
  const dstStart = lastSunday(year, 2);
  const dstEnd = lastSunday(year, 9);
  const visitDate = new Date(Date.UTC(year, month - 1, day));
  const isDST = visitDate >= dstStart && visitDate < dstEnd;
  let startHourUTC = (isDST ? 7 : 8);
  if (time === '2 hours') startHourUTC += 8;
  return new Date(Date.UTC(year, month - 1, day, startHourUTC, 0, 0));
}

export function utcToZulu(date) {
  const pad = n => n.toString().padStart(2, '0');
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) + 'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) + 'Z'
  );
}


export function createAppointment({ title, details, location, start, end, colorId, recurrence }) {
  const params = [
    `action=TEMPLATE`,
    `text=${encodeURIComponent(title || '')}`,
    `details=${encodeURIComponent(details || '')}`,
    `location=${encodeURIComponent(location || '')}`,
    `dates=${utcToZulu(start)}/${utcToZulu(end)}`,
  ];
  if (recurrence) {
    params.push(`recur=${encodeURIComponent(recurrence)}`);
  }
  return `https://calendar.google.com/calendar/render?${params.join('&')}`;
}

export function getEndDate(time, days, startUTC) {
  const endUTC = new Date(startUTC)
  switch (time) {
    case 'full day':
    case 'multiday': endUTC.setUTCHours(endUTC.getUTCHours() + 7);
    case '1/2 day': endUTC.setUTCMinutes(endUTC.getUTCMinutes() + 210);
    case '2 hours': endUTC.setUTCHours(endUTC.getUTCHours() + 2);
    case 'multiday': endUTC.setUTCDate(endUTC.getUTCDate() + +days);
  }

  return endUTC
}

const recurrenceMap = {
  '2 weeks': 14,
  '3 weeks': 21,
  '4 weeks (monthly)': 28,
}

export function calcReocurance(recurrence) {
  return recurrenceMap[recurrence] || ''
}

export function generateRecurrenceDates(visit) {
  if (!visit.recurrence) return []

  const dates = []
  const start = new Date(visit.visitDate + 'T00:00:00Z')
  const endLimit = new Date(start)
  endLimit.setUTCDate(endLimit.getUTCDate() + 365)

  let next = new Date(start)
  const advance = () => next.setUTCDate(next.getUTCDate() + recurrenceMap[visit.recurrence])

  advance()

  while (next <= endLimit) {
    const y = next.getUTCFullYear()
    const m = String(next.getUTCMonth() + 1).padStart(2, '0')
    const d = String(next.getUTCDate()).padStart(2, '0')
    dates.push(`${y}-${m}-${d}`)
    advance()
  }

  return dates
}
export function contactCreateAppointment({ contactName, visit, address }, createAppointmentFn) {
  const fn = createAppointmentFn || createAppointment;
  if (!visit || !visit.visitDate || !visit.time) return '';
  const startUTC = calcStart(...visit.visitDate.split('-'), visit.time);
  return fn({
    title: contactName,
    details: visit.notes,
    location: address,
    start: startUTC,
    end: getEndDate(visit.time, visit.days, startUTC),
    recurrence: calcReocurance(visit.recurrence)
  });
}
