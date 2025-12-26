import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import EditContactPage, { getServerSideProps } from './edit'

jest.mock('../../../lib/contactService', () => ({
    getContact: jest.fn(),
}))

const { getContact } = require('../../../lib/contactService')

describe('Edit contact page', () => {
    afterEach(() => jest.resetAllMocks())

    test('getServerSideProps returns initialValues when service resolves', async () => {
        const mockContact = {
            id: 1,
            name: 'Alice',
            contactTypes: {},
            addresses: [{ address: '123 Main St', visits: [] }],
            rateFullDay: 100,
        }

        getContact.mockResolvedValueOnce(mockContact)

        const res = await getServerSideProps({ params: { id: '1' } })
        expect(res).toHaveProperty('props')
        const props = res.props
        expect(props.initialValues).toBeDefined()
        expect(props.initialValues.name).toBe('Alice')

        render(<EditContactPage {...props} />)

        const nameInput = screen.getByPlaceholderText('Full name')
        expect(nameInput).toBeInTheDocument()
        expect(nameInput.value).toBe('Alice')
    })

    test('getServerSideProps returns error when service throws', async () => {
        getContact.mockRejectedValueOnce(new Error('DB fail'))

        const res = await getServerSideProps({ params: { id: '1' } })
        expect(res).toHaveProperty('props')
        const props = res.props
        expect(props.initialValues).toBeNull()
        expect(typeof props.error).toBe('string')
    })
})
