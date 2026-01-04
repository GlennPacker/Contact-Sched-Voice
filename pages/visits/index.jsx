import { Alert, Table, Button } from 'react-bootstrap'
import indexStyles from './Index.module.scss'
import { getAddressesByIds, getAllAddresses } from '../../lib/addressService'

import Link from 'next/link'
import React, { useState, useMemo } from 'react'
import { getContactsByIds } from '../../lib/contactService'
import { listVisits } from '../../lib/visitService'
import VisitsToolbar from '../../components/VisitsToolbar/VisitsToolbar'

export default function VisitsPage({ visits = [], error = null }) {
  if (error) return <Alert variant="danger">{error}</Alert>
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('none') // 'asc' | 'desc' | 'none'

  const cycleDir = (current) => (current === 'none' ? 'asc' : current === 'asc' ? 'desc' : 'none')

  const handleSortClick = (field) => {
    if (sortField !== field) {
      setSortField(field)
      setSortDir('asc')
      return
    }
    setSortDir((d) => cycleDir(d))
    if (sortField === field && cycleDir(sortDir) === 'none') {
      setSortField(null)
    }
  }

  const renderSortIcon = (field) => {
    if (sortField !== field || sortDir === 'none') return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M2 8h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
    if (sortDir === 'asc') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M8 4l4 6H4l4-6z" fill="currentColor" />
        </svg>
      )
    }
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M8 12l-4-6h8l-4 6z" fill="currentColor" />
      </svg>
    )
  }

  const sortedVisits = useMemo(() => {
    if (!sortField || sortDir === 'none') return visits
    const mapper = (v) => {
      switch (sortField) {
        case 'name':
          return (v.contactName || '').toLowerCase()
        case 'address':
          return (v.address || '').toLowerCase()
        case 'notes':
          return (v.visitNote || '').toLowerCase()
        case 'date':
          return v.visitDate || ''
        case 'inside':
          return v.isInside ? 1 : 0
        default:
          return ''
      }
    }

    const sorted = [...visits].sort((a, b) => {
      const A = mapper(a)
      const B = mapper(b)
      if (A === B) return 0
      if (sortField === 'inside' || typeof A === 'number') {
        return sortDir === 'asc' ? A - B : B - A
      }
      return sortDir === 'asc' ? (A < B ? -1 : 1) : (A > B ? -1 : 1)
    })

    return sorted
  }, [visits, sortField, sortDir])

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Upcoming Visits</h1>
        <div>
          <VisitsToolbar />
        </div>
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
