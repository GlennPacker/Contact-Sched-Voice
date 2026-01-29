import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import Addresses from './Addresses.jsx';
import React from 'react';
import { useForm } from 'react-hook-form';

jest.mock('./Address.jsx', () => {
    const React = require('react');

    return {
        __esModule: true,
        default: props => React.createElement('div', { 'data-testid': 'mock-address' }, `ADDR-${props.idx}`)
    };
});



afterEach(() => {
    cleanup();
    jest.clearAllMocks();
});

function AddressesWithForm(props) {
    const { control, register } = useForm({ defaultValues: { addresses: [] } });
    return React.createElement(Addresses, { ...props, control, register });
}

test('renders an Address element per address field', () => {
    const addressFields = [{ id: 'a' }, { id: 'b' }];
    const props = {
        addressFields,
        removeAddress: jest.fn(),
        appendAddress: jest.fn(),
        errors: {},
        contactName: 'Tomas',
        onCalendarInvite: jest.fn(),
    };

    render(React.createElement(AddressesWithForm, props));
    const items = screen.getAllByTestId('mock-address');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('ADDR-0');
    expect(items[1].textContent).toBe('ADDR-1');
});

test('clicking Add Address calls appendAddress with empty address', () => {
    const addressFields = [{ id: 'a' }];
    const appendAddress = jest.fn();
    const props = {
        addressFields,
        removeAddress: jest.fn(),
        appendAddress,
        errors: {},
        contactName: 'Tomas',
        onCalendarInvite: jest.fn(),
    };

    render(React.createElement(AddressesWithForm, props));
    const btn = screen.getByRole('button', { name: /Add Address/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(appendAddress).toHaveBeenCalledWith({ address: '' });
});

test('renders error message when errors.addresses.message is present', () => {
    const addressFields = [{ id: 'a' }];
    const props = {
        addressFields,
        removeAddress: jest.fn(),
        appendAddress: jest.fn(),
        errors: { addresses: { message: 'oh no' } },
        contactName: 'Tomas',
        onCalendarInvite: jest.fn(),
    };

    render(React.createElement(AddressesWithForm, props));
    const text = screen.getByText('oh no');
    expect(text).toBeInTheDocument();
});

