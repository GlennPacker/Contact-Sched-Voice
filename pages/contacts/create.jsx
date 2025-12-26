import Contact from '../../components/Contact/Contact'
import Link from 'next/link'
import { addContact } from '../../lib/contactService'
import { useRouter } from 'next/router'

export default function NewContactPage() {
  const router = useRouter()
  const createContact = async (contact) => {
    return await addContact(contact)
  }
  return (
    <div>
      <h1>Create Contact</h1>

      <Contact onSubmit={createContact} priceReviewDateReadOnly={true} />
    </div>
  )
}
