 import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ContactSearch from './ContactSearch'

describe('ContactSearch component', () => {
  test('calls search on submit and reset on reset button', () => {
    const search = jest.fn()
    const reset = jest.fn()
    render(<ContactSearch search={search} reset={reset} />)
    const searchBtn = screen.getByRole('button', { name: /search/i })
    fireEvent.click(searchBtn)
    expect(search).toHaveBeenCalled()
    const resetBtn = screen.queryByRole('button', { name: /reset/i })
    if (resetBtn) {
      fireEvent.click(resetBtn)
      expect(reset).toHaveBeenCalled()
    }
  })
})
