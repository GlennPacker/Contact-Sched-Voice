import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Contacts from './Contacts'

describe('Contacts component', () => {
  test('renders contacts and calls onActivate when item clicked', () => {
    const contacts = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
    const onActivate = jest.fn()
    render(<Contacts contacts={contacts} onActivate={onActivate} error={null} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Alice'))
    expect(onActivate).toHaveBeenCalled()
  })
})
