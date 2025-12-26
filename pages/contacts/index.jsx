import React from 'react'
import { Container, Table } from 'react-bootstrap'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function ContactsPage({ contacts }) {
    return (
        <Container className="u-page-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Contacts</h1>
                <Link href="/contacts/create">Create contact</Link>
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Addresses</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map((c) => (
                        <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>
                                {c.addresses && c.addresses.length > 0 ? (
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
        </Container>
    )
}

export async function getServerSideProps() {
    const { data, error } = await supabase
        .from('contacts')
        .select('id, name, addresses(address)')
        .order('id', { ascending: false })
        .limit(25)

    if (error) {
        console.error('Error fetching contacts:', error)
        return { props: { contacts: [] } }
    }

    return { props: { contacts: data || [] } }
}
