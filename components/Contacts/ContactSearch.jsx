import React, { useState } from 'react'
import { Form, Row, Col, Button } from 'react-bootstrap'
import styles from './ContactSearch.module.scss'

export default function ContactSearch({ search, reset }) {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')

    const submit = (e) => {
        e.preventDefault()
        if (search) search({ name, address })
    }

    const clear = (e) => {
        e.preventDefault()
        setName('')
        setAddress('')
        if (reset) reset()
    }

    return (
        <div className={styles.container}>
            <Form onSubmit={submit} className={styles.form}>
                <Row className="g-2">
                    <Col xs={12} md={5}>
                        <Form.Group controlId="filterName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Filter by name"
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={5}>
                        <Form.Group controlId="filterAddress">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Filter by address"
                            />
                        </Form.Group>
                    </Col>

                    <Col xs={12} md={2} className={styles.applyCol}>
                        <Button type="submit" variant="primary" size="sm">Search</Button>
                        <Button variant="outline-secondary" size="sm" className="ms-2" onClick={clear}>Clear</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}
