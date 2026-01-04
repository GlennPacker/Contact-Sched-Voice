import React from 'react'
import calStyles from './Calendar.module.scss'
import { useRouter } from 'next/router'
import VisitsToolbar from '../../components/VisitsToolbar/VisitsToolbar'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { listVisits } from '../../lib/visitService'
import { getAddressesByIds } from '../../lib/addressService'
import { getContactsByIds } from '../../lib/contactService'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

export default function VisitsCalendarPage({ events = [] }) {
  const router = useRouter()

  const handleSelectEvent = (event) => {
    const contactId = event.resource && event.resource.contactId
    if (contactId) router.push(`/contacts/${contactId}/edit`)
  }

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
          events={events.map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          popup
        />
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const allVisits = await listVisits({ fromDate: today, order: 'asc', limit: 500 })

    const addressIds = [...new Set(allVisits.map((v) => v.addressId))]
    const addresses = addressIds.length ? await getAddressesByIds(addressIds) : []
    const contactIds = [...new Set((addresses || []).map((a) => a.contactId))]
    const contacts = contactIds.length ? await getContactsByIds(contactIds) : []

    const addressMap = Object.fromEntries((addresses || []).map((a) => [a.id, a]))
    const contactMap = Object.fromEntries((contacts || []).map((c) => [c.id, c]))

    const events = (allVisits || []).map((v) => {
      const addr = addressMap[v.addressId]
      const contact = addr ? contactMap[addr.contactId] : null
      const title = `${(contact && contact.name) || 'Unknown'} — ${(addr && addr.address) || ''}`
      const start = new Date(v.visitDate + 'T00:00:00')
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      return { title, start: start.toISOString(), end: end.toISOString(), allDay: true, resource: { visit: v, contactId: contact && contact.id } }
    })

    return { props: { events } }
  } catch (err) {
    return { props: { events: [], error: err && err.message ? err.message : 'Server error' } }
  }
}
