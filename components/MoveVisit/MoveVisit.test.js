import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import MoveVisit from './MoveVisit';
jest.mock('../../lib/calendarService', () => ({
  hasFutureDatesApi: jest.fn(() => Promise.resolve({ exists: false }))
}));
jest.mock('../../lib/visitService', () => ({
  updateVisitTableDate: jest.fn(() => Promise.resolve()),
  updateVisitDate: jest.fn(() => Promise.resolve()),
  updateFutureVisitDates: jest.fn(() => Promise.resolve())
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    reload: jest.fn(),
  }),
}));

describe('MoveVisit', () => {
  const visit = { id: 1, visitDate: '2026-01-13' };

  it('renders move button', async () => {
    await act(async () => {
      render(
        <MoveVisit
          visit={visit}
          loading={false}
        />
      );
    });
    expect(screen.getByRole('button', { name: /move dates/i })).toBeInTheDocument();
  });

  it('opens modal on click', async () => {
    await act(async () => {
      render(
        <MoveVisit
          visit={visit}
          loading={false}
        />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /move dates/i }));
    });
    expect(await screen.findByText(/Move Visit/)).toBeInTheDocument();
  });

  it('disables move button when loading', async () => {
    await act(async () => {
      render(
        <MoveVisit
          visit={visit}
          loading={true}
        />
      );
    });
    expect(screen.getByRole('button', { name: /move dates/i })).toBeDisabled();
  });

  it('shows and closes modal', async () => {
    await act(async () => {
      render(
        <MoveVisit
          visit={visit}
          loading={false}
        />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /move dates/i }));
    });
    expect(screen.getByText(/Move Visit/)).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });
    expect(screen.queryByText(/Move Visit/)).not.toBeInTheDocument();
  });

});
