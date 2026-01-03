import { Alert, Table, Button } from 'react-bootstrap'
import indexStyles from './Index.module.scss'
import { getAddressesByIds, getAllAddresses } from '../../lib/addressService'

import Link from 'next/link'
import React from 'react'
import { getContactsByIds } from '../../lib/contactService'
import { listVisits } from '../../lib/visitService'

export default function VisitsPage({ visits = [], error = null }) {
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Upcoming Visits</h1>
        <Link href="/visits/calendar" passHref>
          <Button variant="secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 24 24" aria-hidden>
              <path d="M7 10h5v5H7z" />
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V9h14v9z" />
            </svg>
            Calendar
          </Button>
        </Link>
      </div>

      {!visits.length ? (
        <Alert variant="info">No upcoming visits</Alert>
      ) : (
        <Table striped bordered hover responsive className={indexStyles.visitsTable}>
          <thead>
            <tr>
              <th className={indexStyles.colName}>Name</th>
              <th className={indexStyles.colAddress}>Address</th>
              <th>Notes</th>
              <th className={indexStyles.colDate}>Date</th>
              <th className={indexStyles.colInside}>Inside</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v, idx) => (
              <tr key={`${v.contactId}-${v.addressId}-${v.visitDate}-${idx}`}>
                <td>
                  {v.contactId ? (
                    <Link href={`/contacts/${v.contactId}/edit`} passHref>
                      {v.contactName || '—'}
                    </Link>
                  ) : (
                    v.contactName || '—'
                  )}
                </td>
                <td>{v.address || '—'}</td>
                <td>{v.visitNote || '—'}</td>
                <td>{v.visitDate || '—'}</td>
                <td>{v.isInside ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export async function getServerSideProps() {
  try {
    const today = new Date().toISOString().split('T')[0]

    const allVisits = await listVisits({ fromDate: today, order: 'asc', limit: 25 })

    const addressIds = [...new Set(allVisits.map((v) => v.addressId))]

    const addresses = addressIds.length ? await getAddressesByIds(addressIds) : []
    const contactIds = [...new Set(addresses.map((a) => a.contactId))]

    const contacts = contactIds.length ? await getContactsByIds(contactIds) : []

    const addressMap = Object.fromEntries((addresses || []).map((a) => [a.id, a]))
    const contactMap = Object.fromEntries((contacts || []).map((c) => [c.id, c]))

    const visits = allVisits.map((v) => {
      const address = addresses.find(a => a.id === v.addressId);
      const contact = contacts.find(c => c.id === address.contactId);

      return {
        contactId: contact.id,
        contactName: contact.name,
        addressId: address.id,
        address: address.address,
        visitNote: v.notes,
        visitDate: v.visitDate,
        isInside: v.isInside,
      }
    })

    return { props: { visits, error: null } }
  } catch (err) {
    return { props: { visits: [], error: err && err.message ? err.message : 'Server error' } }
  }
}
