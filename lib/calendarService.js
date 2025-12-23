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
  if(time === '2 hours') startHourUTC += 8;
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
  console.log('aaa', { title, details, location, start, end, colorId, recurrence });
  
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
 let endUTC = new Date(startUTC);
  if (time === 'full day') {
    endUTC.setHours(endUTC.getHours() + 7);
  } else if (time === '1/2 day') {
    endUTC.setHours(endUTC.getHours() + 4);
  } else if (time === '2 hours') {
    endUTC.setHours(endUTC.getHours() + 2);
  } else if (time === 'multiday' && days > 1) {
    endUTC.setDate(endUTC.getDate() + Number(days || 1));
    endUTC.setHours(endUTC.getHours() + 7);
  } else {
    endUTC.setHours(endUTC.getHours() + 1);
  }

  return endUTC;
}

export function calcReocurance(recurrence) {
    const map = {
        '2 weeks': 'RRULE:FREQ=WEEKLY;INTERVAL=2',
        '3 weeks': 'RRULE:FREQ=WEEKLY;INTERVAL=3',
        '4 weeks (monthly)': 'RRULE:FREQ=MONTHLY;INTERVAL=1'
    }

    return map[recurrence] || '';
} 

export function contactCreateAppointment({ contactName, visit, address }, createAppointmentFn) {
  const fn = createAppointmentFn || createAppointment;
  const startUTC = calcStart(...visit.date.split('-'), visit.time);
  return fn({
    title: contactName,
    details: visit.note || '',
    location: address,
    start: startUTC,
    end: getEndDate(visit.time, visit.days, startUTC),
    recurrence: calcReocurance(visit.recurrence)
  });
}
