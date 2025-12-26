import React, { useState, useMemo } from 'react'
import styles from './index.module.scss'
import { Alert, Button, ButtonGroup } from 'react-bootstrap'
import Contacts from '../../components/Contacts/Contacts'
import ContactSearch from '../../components/Contacts/ContactSearch'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { listContacts, searchContacts } from '../../lib/contactService'

export default function ContactsPage({ contacts = [], error = null }) {
  const router = useRouter()
  const navigateToEdit = (id) => router.push(`/contacts/${id}/edit`)
  const [showSearch, setShowSearch] = useState(false)
  const [displayedContacts, setDisplayedContacts] = useState(Array.isArray(contacts) ? contacts : [])

  React.useEffect(() => setDisplayedContacts(Array.isArray(contacts) ? contacts : []), [contacts])

  const search = async ({ name, address }) => {
    try {
      const data = await searchContacts({ name, address })
      setDisplayedContacts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  const resetSearch = () => {
    setDisplayedContacts(Array.isArray(contacts) ? contacts : [])
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Contacts</h1>
        <div>
          <ButtonGroup aria-label="contacts-actions">
            <Button
              variant="secondary"
              size="sm"
              aria-expanded={showSearch}
              onClick={() => setShowSearch((s) => !s)}
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

      <div className={`${styles.filterCollapse} ${showSearch ? styles.filterCollapseOpen : ''}`}>
        <ContactSearch search={search} reset={resetSearch} />
      </div>

      <Contacts contacts={displayedContacts} error={error} onActivate={navigateToEdit} />
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

