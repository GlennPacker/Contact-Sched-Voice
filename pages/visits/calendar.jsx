import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import React, { useState } from 'react';

import CalendarToast from '../../components/CalendarToast/CalendarToast';
import VisitsToolbar from '../../components/VisitsToolbar/VisitsToolbar';
import calStyles from './Calendar.module.scss';
import { enUS } from 'date-fns/locale';
import format from 'date-fns/format';
import { getAddressesByIds } from '../../lib/addressService';
import { getContactsByIds } from '../../lib/contactService';
import getDay from 'date-fns/getDay';
import { listVisits } from '../../lib/visitService';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import { useRouter } from 'next/router';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function VisitsCalendarPage({ events = [] }) {
  const router = useRouter();

  const [toastData, setToastData] = useState(null);

  const handleSelectEvent = ({ resource }) => {
    if (!resource?.visit) return;
    setToastData({ contact: resource.contact, address: resource.address, visit: resource.visit });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Visits Calendar</h1>
        <div>
          <VisitsToolbar />
        </div>
      </div>
      <div className={calStyles.calendarWrapper}>
        <Calendar
          localizer={localizer}
          events={events.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          popup
        />
      </div>
      <CalendarToast show={!!toastData} onClose={() => setToastData(null)} data={toastData} />
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allVisits = await listVisits({ fromDate: today, order: 'asc', limit: 500 });

    const addressIds = [...new Set(allVisits.map(v => v.addressId))];
    const addresses = addressIds.length ? await getAddressesByIds(addressIds) : [];
    const contactIds = [...new Set((addresses || []).map(a => a.contactId))];
    const contacts = contactIds.length ? await getContactsByIds(contactIds) : [];

    const addressMap = Object.fromEntries((addresses || []).map(a => [a.id, a]));
    const contactMap = Object.fromEntries((contacts || []).map(c => [c.id, c]));

    const events = (allVisits || []).map(v => {
      const addr = addressMap[v.addressId];
      const contact = addr ? contactMap[addr.contactId] : null;
      const title = `${(contact && contact.name) || 'Unknown'} — ${(addr && addr.address) || ''}`;
      const start = new Date(v.visitDate + 'T00:00:00');
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      return { title, start: start.toISOString(), end: end.toISOString(), allDay: true, resource: { visit: v, contact: contact || null, address: addr || null } };
    });

    return { props: { events } };
  } catch (err) {
    return { props: { events: [], error: err?.message || 'Server error' } };
  }
}
