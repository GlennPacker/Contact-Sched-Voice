import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import React, { useState } from 'react';

import CalendarKey from '../../../components/CalendarKey/CalendarKey';
import CalendarToast from '../../../components/CalendarToast/CalendarToast';
import VisitsToolbar from '../../../components/VisitsToolbar/VisitsToolbar';
import calStyles from './Calendar.module.scss';
import { enUS } from 'date-fns/locale';
import format from 'date-fns/format';
import * as addressService from '../../../lib/addressService';
import { getContactsByIds } from '../../../lib/contactService';
import getDay from 'date-fns/getDay';
import { listVisits } from '../../../lib/visitService';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { parseISO, addMonths, startOfMonth } from 'date-fns';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function VisitsCalendarPage({ events = [] }) {
  const router = useRouter();

  const [toastData, setToastData] = useState(null);

  const handleSelectEvent = ({ resource }) => {
    setToastData(resource);
  };

  const handleNavigate = date => {
    const today = new Date();
    const newMonth = date.getMonth();
    const newYear = date.getFullYear();
    const offset = (newYear - today.getFullYear()) * 12 + (newMonth - today.getMonth());
    let urlPart;
    if (offset === 0) {
      urlPart = 'current';
    } else {
      urlPart = String(offset);
    }
    router.push(`/visits/calendar/${urlPart}`);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Visits Calendar</h1>
        <VisitsToolbar />
      </div>
      <CalendarKey />
      <div className={calStyles.calendarWrapper}>
        <Calendar
          localizer={localizer}
          events={events.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onNavigate={handleNavigate}
          popup
        />
      </div>
      <CalendarToast
        onClose={() => setToastData(null)}
        data={toastData} />
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const { month } = context.params || {};
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
        allDay: true,
        end: end.toISOString(),
        resource: {
          address: addr,
          contact,
          futureVisits,
          visit: v,
        },
        start: start.toISOString(),
        title
      };
    });

    return { props: { events } };
  } catch (err) {
    return { props: { events: [], error: err?.message || 'Server error' } };
  }
}
