import '@testing-library/jest-dom'

import ContactsPage, { getServerSideProps } from './index'
import { fireEvent, render, screen } from '@testing-library/react'

import React from 'react'

jest.mock('next/router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('next/link', () => ({ children }) => children)

jest.mock('../../lib/contactService', () => ({
    listContacts: jest.fn(),
}))

const { listContacts } = require('../../lib/contactService')

describe('Contacts page', () => {
    afterEach(() => jest.resetAllMocks())

    test('renders contacts list when service returns data', async () => {
        const mockData = [
            { id: 1, name: 'Alice', addresses: [{ address: '123 Main St' }] },
            { id: 2, name: 'Bob', addresses: [] },
        ]
        listContacts.mockResolvedValueOnce(mockData)

        const res = await getServerSideProps()
        expect(res).toHaveProperty('props')
        const props = res.props
        expect(props.error).toBeNull()
        expect(Array.isArray(props.contacts)).toBe(true)

        render(<ContactsPage {...props} />)

        expect(screen.getByText('Contacts')).toBeInTheDocument()
        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.getByText('123 Main St')).toBeInTheDocument()
        expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    test('renders error Alert when service throws', async () => {
        listContacts.mockRejectedValueOnce(new Error('DB failure'))

        const res = await getServerSideProps()
        expect(res).toHaveProperty('props')
        const props = res.props
        expect(props.contacts).toBeNull()
        expect(typeof props.error).toBe('string')

        render(<ContactsPage {...props} />)

        expect(screen.getByText('DB failure')).toBeInTheDocument()
        expect(screen.queryByText('Alice')).toBeNull()
    })
})
