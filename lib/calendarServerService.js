import { listVisits } from './visitService';
import { getContactsByIds } from './contactService';
import { supabase } from './supabaseClient';
import { startOfMonth, addMonths } from 'date-fns';
import { getVisitEventColor } from './visitUtils';

// Dynamic import for addressService to avoid client bundle issues
export async function getCalendarEventsSSR({ month }) {
  const today = new Date();
  let calendarStart;
  if (month === 'current' || !month) {
    calendarStart = startOfMonth(today);
  } else {
    const offset = parseInt(month, 10);
    if (!isNaN(offset)) {
      calendarStart = startOfMonth(addMonths(today, offset));
    } else {
      calendarStart = startOfMonth(today);
    }
  }
  const fromDate = calendarStart.toISOString().split('T')[0];
  const allVisits = await listVisits({ fromDate, order: 'asc', limit: 500 });

  const addressIds = [...new Set(allVisits.map(v => v.addressId))];
  const addressService = await import('./addressService.js');
  const addresses = addressIds.length ? await addressService.getById(addressIds) : [];
  const contactIds = [...new Set((addresses || []).map(a => a.contactId))];
  const contacts = contactIds.length ? await getContactsByIds(contactIds) : [];

  const addressMap = Object.fromEntries((addresses || []).map(a => [a.id, a]));
  const contactMap = Object.fromEntries((contacts || []).map(c => [c.id, c]));

  const visitIds = (allVisits || []).map(v => v.id).filter(x => !!x);
  const { data: calRows = [] } = visitIds.length
    ? await supabase.from('calendars').select('visitId,date,id').in('visitId', visitIds).gte('date', fromDate).order('date', { ascending: true })
    : { data: [] };

  const addressCalendarMap = {};
  for (const row of calRows || []) {
    const vid = row.visitId;
    const visitObj = (allVisits || []).find(x => x.id === vid);
    const aid = visitObj ? visitObj.addressId : null;
    if (!aid) continue;
    addressCalendarMap[aid] = addressCalendarMap[aid] || [];
    if (row.date) addressCalendarMap[aid].push(row.date);
  }

  const events = (allVisits || []).map(v => {
    const addr = addressMap[v.addressId];
    const contact = addr ? contactMap[addr.contactId] : null;
    const title = `${(contact && contact.name) || 'Unknown'} — ${(addr?.address) || ''}`;
    const start = new Date(v.visitDate + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const futureVisits = (addressCalendarMap[v.addressId] || []).filter(d => d > v.visitDate).sort().slice(0, 10);

    return {
      id: v.id,
      allDay: true,
      end: end.toISOString(),
      resource: {
        address: addr,
        contact,
        futureVisits,
        visit: v,
      },
      start: start.toISOString(),
      title,
      eventColor: getVisitEventColor(v),
    };
  });

  return events;
}
