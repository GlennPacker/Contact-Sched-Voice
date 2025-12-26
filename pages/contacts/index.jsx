import React, { useState } from 'react'
import styles from './index.module.scss'
import { Alert, Button, ButtonGroup } from 'react-bootstrap'
import Contacts from '../../components/Contacts/Contacts'
import ContactFilter from '../../components/Contacts/filter/ContactFilter'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { listContacts } from '../../lib/contactService'

export default function ContactsPage({ contacts = [], error = null }) {
  const router = useRouter()
  const navigateToEdit = (id) => router.push(`/contacts/${id}/edit`)
  const [showFilter, setShowFilter] = useState(false)

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Contacts</h1>
        <div>
          <ButtonGroup aria-label="contacts-actions">
            <Button
              variant="secondary"
              size="sm"
              aria-expanded={showFilter}
              onClick={() => setShowFilter((s) => !s)}
            >
              Search
            </Button>
            &nbsp;
            <Link href="/contacts/create" passHref>
              <Button variant="secondary" size="sm">Create</Button>
            </Link>
          </ButtonGroup>
        </div>
      </div>

      <div className={`${styles.filterCollapse} ${showFilter ? styles.filterCollapseOpen : ''}`}>
        <ContactFilter />
      </div>

      <Contacts contacts={contacts} error={error} onActivate={navigateToEdit} />
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

