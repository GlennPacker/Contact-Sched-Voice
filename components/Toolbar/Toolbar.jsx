import React from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import Link from 'next/link'

export default function Toolbar() {
    return (
        <Navbar bg="light" expand="sm" className="mb-3 w-100">
            <Container fluid>
                <div className="toolbar-inner">
                    <Link href="/" passHref legacyBehavior>
                        <Navbar.Brand>H Andy</Navbar.Brand>
                    </Link>
                    <Navbar.Toggle aria-controls="main-nav" />
                    <Navbar.Collapse id="main-nav">
                        <Nav className="ms-auto">
                            <Link href="/contacts" passHref legacyBehavior>
                                <Nav.Link>List Contacts</Nav.Link>
                            </Link>
                            <Link href="/contacts/create" passHref legacyBehavior>
                                <Nav.Link>Create Contact</Nav.Link>
                            </Link>
                        </Nav>
                    </Navbar.Collapse>
                </div>
            </Container>
        </Navbar>
    )
}
