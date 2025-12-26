import Contact from '../../../components/Contact/Contact'
import Link from 'next/link'
import { getContact, updateContact } from '../../../lib/contactService'

export default function EditContactPage({ initialValues = null, error = null, id }) {
    if (error) {
        return (
            <div>
                <h1>Edit Contact</h1>
                <div style={{ color: 'red' }}>{error}</div>
                <p>
                    <Link href="/contacts">Back to contacts</Link>
                </p>
            </div>
        )
    }

    const submit = async (contact) => {
        return await updateContact(id, contact)
    }

    return (
        <div>
            <h1>Edit Contact</h1>

            <Contact initialValues={initialValues} onSubmit={submit} priceReviewDateReadOnly={false} />
        </div>
    )
}

export async function getServerSideProps({ params }) {
    const id = params.id
    try {
        const data = await getContact(id)
        return { props: { initialValues: data, id } }
    } catch (err) {
        return { props: { initialValues: null, error: err && err.message ? err.message : 'Server error' } }
    }
}
