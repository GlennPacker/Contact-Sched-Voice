import Contact from '../../components/Contact/Contact';
import { addContact } from '../../lib/contactService';
import { useRouter } from 'next/router';

export default function NewContactPage() {
  const router = useRouter();
  const createContact = async contact => {
    const result = await addContact(contact);
    if (!result.error) {
      router.push('/visits/calendar');
    }
    return result;
  };

  return (
    <Contact
      submit={createContact}
      priceReviewDateReadOnly={true}
      title="Create Contact" />
  );
}