import React from 'react';
import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
import CalendarToastToolbar from './CalendarToastToolbar';
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    pathname: '/mock-path',
    query: {},
    asPath: '/mock-path',
    route: '/mock-path',
    basePath: '',
    isFallback: false,
    isReady: true,
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
    beforePopState: jest.fn(),
    isLocaleDomain: false,
    isPreview: false
  })
}));
import * as visitService from '../../lib/visitService';
jest.mock('../../lib/visitService', () => ({
  cancelVisitApi: jest.fn(() => Promise.resolve()),
  cancelFutureVisitsApi: jest.fn(() => Promise.resolve())
}));
jest.mock('../../lib/calendarService', () => ({
  hasFutureDatesApi: jest.fn(() => Promise.resolve({ exists: false }))
}));

describe('CalendarToastToolbar', () => {
  const visit = { id: 1, visitDate: '2026-01-13' };
  const contact = { id: 123 };
  const data = { visit, contact };

  it('renders all action buttons', async () => {
    await act(async () => {
      render(
        <CalendarToastToolbar
          data={data}
        />
      );
    });
    expect(screen.getByRole('button', { name: 'Load invoice data' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel visit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete all future visits' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'move dates' })).toBeInTheDocument();
  });

  it('disables buttons when loading', async () => {
    const neverResolves = new Promise(() => { });
    jest.spyOn(visitService, 'cancelVisitApi').mockImplementation(() => neverResolves);
    await act(async () => {
      render(
        <CalendarToastToolbar
          data={data}
        />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel visit' }));
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel visit' })).toBeDisabled();
    });
  });
});
