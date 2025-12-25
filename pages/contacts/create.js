import Contact from '../../components/Contact/Contact'
import { Container } from 'react-bootstrap'
import Link from 'next/link'
import { addContact } from '../../lib/contactService'
import { useRouter } from 'next/router'

export default function NewContactPage() {
  const router = useRouter()

  const handleCreate = async (contact) => {
    return await addContact(contact)
  }
  return (
    <Container className="u-page-container">
      <h1>Create Contact</h1>

      <Contact onSubmit={handleCreate} priceReviewDateReadOnly={true} />

      <div className="u-mt-sm">
        <Link href="/">Back home</Link>
      </div>
    </Container>
  )
}
