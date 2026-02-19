import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CalendarToast from '../CalendarToast/CalendarToast';
import VisitsToolbar from '../VisitsToolbar/VisitsToolbar';
import calStyles from '../../pages/visits/calendar/Calendar.module.scss';
import { enGB } from 'date-fns/locale';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import React, { useState } from 'react';

const locales = { 'en-GB': enGB };
function startOfWeekMonday(date, options) {
  return startOfWeek(date, { weekStartsOn: 1, ...options });
}

const localizer = dateFnsLocalizer({ format, parse, startOfWeek: startOfWeekMonday, getDay, locales, locale: enGB });
const DnDCalendar = withDragAndDrop(Calendar);


export default function CalendarView({ events: initialEvents }) {
  const [events, setEvents] = useState(initialEvents);
  const [toastData, setToastData] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectCalendarAppointment = ({ resource }) => setToastData(resource);

  const handleSelectSlot = ({ start }) => {
    const pad = n => n.toString().padStart(2, '0');
    const d = start;
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    window.location.href = `/contacts/create?visitDate=${dateStr}`;
  };

  const handleEventDrop = ({ event, start, end, allDay }) => {
    setPendingMove({ event, start, end, allDay });
  };

  const confirmMove = async () => {
    if (pendingMove && !loading) {
      setLoading(true);
      const { id: calendarId, visitDate, visitId } = pendingMove.event.resource.visit;
      const pad = n => n.toString().padStart(2, '0');
      const d = pendingMove.start;
      const newDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      try {
        const mod = await import('../../lib/calendarService');
        await mod.moveVisitApi({ calendarId, visitId, newDate, moveFuture: false, originalDate: visitDate });



        const { getCalendarEventsSSR } = await import('../../lib/calendarServerService');
        const refreshed = await getCalendarEventsSSR({ month: 'current' });
        setEvents(refreshed);
        setPendingMove(null);
        setToastData(null);
      } catch (e) {
        alert('Failed to move visit: ' + (e.message || e));
      }
      setLoading(false);
    }
    setPendingMove(null);
  };

  const cancelMove = () => setPendingMove(null);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <VisitsToolbar />
      </div>
      <div className={calStyles.calendarWrapper}>
        <DnDCalendar
          localizer={localizer}
          events={events.map(e => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end)
          }))}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={selectCalendarAppointment}
          onSelectSlot={handleSelectSlot}
          selectable
          onEventDrop={handleEventDrop}
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
      <CalendarToast
        onClose={() => setToastData(null)}
        data={toastData} />
      {pendingMove && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div
            className="modal-dialog"
            role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Move Visit</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={cancelMove} />
              </div>
              <div className="modal-body">
                <p>Move <strong>{pendingMove.event.title}</strong> to <strong>{pendingMove.start.toLocaleDateString('en-GB')}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelMove}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmMove}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  );
}


