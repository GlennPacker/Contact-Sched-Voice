import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { addMonths, startOfMonth } from 'date-fns';
import CalendarToast from '../CalendarToast/CalendarToast';
import { VisitTime } from '../../lib/referenceDataService';
import VisitsToolbar from '../VisitsToolbar/VisitsToolbar';
import calStyles from '../../pages/visits/calendar/Calendar.module.scss';
import { enGB } from 'date-fns/locale';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import { getCalendarEventsSSR } from '../../lib/calendarServerService';
import React, { useState } from 'react';

const locales = { 'en-GB': enGB };
function startOfWeekMonday(date, options) {
  return startOfWeek(date, { weekStartsOn: 1, ...options });
}
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: startOfWeekMonday, getDay, locales, locale: enGB });

export default function CalendarView({ events }) {
  const [toastData, setToastData] = useState(null);
  const handleSelectEvent = ({ resource }) => setToastData(resource);
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <VisitsToolbar />
      </div>
      <div className={calStyles.calendarWrapper}>
        <Calendar
          localizer={localizer}
          events={events.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          popup
          eventPropGetter={event => {
            const visit = event.resource?.visit;
            let borderColor = 'transparent';
            if (visit) {
              borderColor = visit.isInside ? '#2ecc40' : '#0074d9';
            }
            return {
              style: {
                backgroundColor: event.eventColor,
                color: event.eventColor === '#FFEB3B' ? '#333' : '#fff',
                borderRadius: '6px',
                border: `4px solid ${borderColor}`,
              }
            };
          }}
        />
      </div>
      <CalendarToast onClose={() => setToastData(null)} data={toastData} />
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const { month } = context.params || {};
    const events = await getCalendarEventsSSR({ month });
    return { props: { events } };
  } catch (err) {
    return { props: { events: [], error: err?.message || 'Server error' } };
  }
}
