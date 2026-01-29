import { getContact, updateContact } from '../../../lib/contactService';

import Contact from '../../../components/Contact/Contact';
import Link from 'next/link';
import styles from './EditContact.module.scss';

export default function EditContactPage({ initialValues = null, error = null, id }) {
    if (error) {
        return (
            <div>
                <h1>Edit Contact</h1>
                <div className={styles.error}>{error}</div>
                <p>
                    <Link href="/contacts">Back to contacts</Link>
                </p>
            </div>
        );
    }

    const submit = async contact => {
        return await updateContact(id, contact);
    };

    return (
        <div>
            <Contact
                initialValues={initialValues}
                submit={submit}
                priceReviewDateReadOnly={false}
                title="Edit Contact" />
        </div>
    );
}

export async function getServerSideProps({ params }) {
    const id = params.id;
    try {
        const data = await getContact(id);

        return { props: { initialValues: data, id } };
    } catch (err) {
        return { props: { initialValues: null, error: err?.message || 'Server error' } };
    }
}
