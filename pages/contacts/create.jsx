import Contact from '../../components/Contact/Contact';
import { addContact } from '../../lib/contactService';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function NewContactPage() {
  const router = useRouter();
  const [initialValues, setInitialValues] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (router.isReady) {
      const { visitDate } = router.query;
      if (visitDate) {
        setInitialValues({
          addresses: [{
            address: '',
            visits: [{ visitDate }]
          }]
        });
      }
      setIsReady(true);
    }
  }, [router.isReady, router.query]);
  
  const createContact = async contact => {
    const result = await addContact(contact);
    if (!result.error) {
      router.push('/visits/calendar');
    }
    return result;
  };

  if (!isReady) {
    return null;
  }

  return (
    <Contact
      submit={createContact}
      priceReviewDateReadOnly={true}
      title="Create Contact"
      initialValues={initialValues} />
  );
}