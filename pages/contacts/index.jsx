import React from 'react'
import { Table, Alert } from 'react-bootstrap'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { listContacts } from '../../lib/contactService'

export default function ContactsPage({ contacts = [], error = null }) {
  const router = useRouter()
  const navigateToEdit = (id) => router.push(`/contacts/${id}/edit`)

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Contacts</h1>
        <Link href="/contacts/create">Create contact</Link>
      </div>

      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Addresses</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => navigateToEdit(c.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigateToEdit(c.id) }}
                style={{ cursor: 'pointer' }}
              >
                <td>{c.name}</td>
                <td>
                  {c.addresses && c.addresses.length ? (
                    c.addresses.map((a, i) => (
                      <div key={i}>{a.address}</div>
                    ))
                  ) : (
                    <span className="text-muted">No addresses</span>
                  )}
                </td>
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
    const data = await listContacts()
    return { props: { contacts: data, error: null } }
  } catch (err) {
    return { props: { contacts: null, error: err && err.message ? err.message : 'Server error' } }
  }
}

