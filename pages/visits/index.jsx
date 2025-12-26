import React from 'react'
import Link from 'next/link'
import { Table, Alert } from 'react-bootstrap'
import { listVisits } from '../../lib/visitService'
import { getContactsByIds } from '../../lib/contactService'
import { getAllAddresses, getAddressesByIds } from '../../lib/addressService'

export default function VisitsPage({ visits = [], error = null }) {
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Upcoming Visits</h1>
      </div>

      {visits.length === 0 ? (
        <Alert variant="info">No upcoming visits</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Notes</th>
              <th>Date</th>
              <th>Inside</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v, idx) => (
              <tr key={`${v.contactId}-${v.addressId}-${v.date}-${idx}`}>
                <td>
                  {v.contactId ? (
                    <Link href={`/contacts/${v.contactId}/edit`} passHref>
                      <a>{v.contactName || '—'}</a>
                    </Link>
                  ) : (
                    v.contactName || '—'
                  )}
                </td>
                <td>{v.addressText || '—'}</td>
                <td>{v.visitNote || '—'}</td>
                <td>{v.date || '—'}</td>
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
        date: v.date,
        isInside: v.isInside,
      }
    })

    return { props: { visits, error: null } }
  } catch (err) {
    return { props: { visits: [], error: err && err.message ? err.message : 'Server error' } }
  }
}
