
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

jest.mock('./Address.jsx', () => ({
    __esModule: true,
    default: (props) => React.createElement('div', { 'data-testid': 'mock-address' }, `ADDR-${props.idx}`)
}))

import Addresses from './Addresses.jsx'

afterEach(() => {
    cleanup()
    jest.clearAllMocks()
})

test('renders an Address element per address field', () => {
    const addressFields = [{ id: 'a' }, { id: 'b' }]
    const props = {
        addressFields,
        register: jest.fn(),
        removeAddress: jest.fn(),
        appendAddress: jest.fn(),
        errors: {},
        control: {},
        contactName: 'Tomas',
        onCalendarInvite: jest.fn(),
    }

    render(React.createElement(Addresses, props))
    const items = screen.getAllByTestId('mock-address')
    expect(items).toHaveLength(2)
    expect(items[0].textContent).toBe('ADDR-0')
    expect(items[1].textContent).toBe('ADDR-1')
})

test('clicking Add Address calls appendAddress with empty address', () => {
    const addressFields = [{ id: 'a' }]
    const appendAddress = jest.fn()
    const props = {
        addressFields,
        register: jest.fn(),
        removeAddress: jest.fn(),
        appendAddress,
        errors: {},
        control: {},
        contactName: 'Tomas',
        onCalendarInvite: jest.fn(),
    }

    render(React.createElement(Addresses, props))
    const btn = screen.getByRole('button', { name: /Add Address/i })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(appendAddress).toHaveBeenCalledWith({ address: '' })
})

test('renders error message when errors.addresses.message is present', () => {
    const addressFields = [{ id: 'a' }]
    const props = {
        addressFields,
        register: jest.fn(),
        removeAddress: jest.fn(),
        appendAddress: jest.fn(),
        errors: { addresses: { message: 'oh no' } },
        control: {},
        contactName: 'Tomas',
        onCalendarInvite: jest.fn(),
    }

    render(React.createElement(Addresses, props))
    const text = screen.getByText('oh no')
    expect(text).toBeInTheDocument()
})

