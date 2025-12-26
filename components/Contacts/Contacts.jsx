import React from 'react'
import { Table, Alert } from 'react-bootstrap'
import styles from './Contacts.module.scss'

export default function Contacts({ contacts = [], error = null, onActivate }) {
    if (error) return <Alert variant="danger">{error}</Alert>

    return (
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
                        onClick={() => onActivate && onActivate(c.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onActivate && onActivate(c.id) }}
                        className={styles.clickableRow}
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
    )
}
