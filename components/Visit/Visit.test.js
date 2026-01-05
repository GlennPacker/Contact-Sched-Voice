import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Visit from './Visit.jsx';

describe('Visit component', () => {
  const baseStyles = {
    'visit-fields': 'vf',
    'visit-collapsed-summary': 'vcs',
    'visit-cursor-pointer': 'vcp',
    'visit-collapsed-date': 'vcd',
    'visit-collapsed-recurrence': 'vcr',
    'visit-summary-text': 'vst',
    'visit-fields-col': 'vfc',
    'visit-field-row': 'vfr',
    'visit-label': 'vl',
    'visit-date': 'vd',
    'visit-isFlexible': 'vif',
    'visit-time': 'vt',
    'visit-days': 'vdays',
    'visit-recurrence': 'vr',
    'visit-isInside': 'vinside',
    'visit-note': 'vnote',
    'visit-field-row': 'vfr',
    'visit-label': 'vl',
    'visit-collapsed-summary': 'vcs',
    'visit-collapsed-date': 'vcd',
    'calendar-error': 'cerr',
  };

  it('renders collapsed summary and toggles collapse on click', () => {
    const toggleCollapse = jest.fn();
    const remove = jest.fn();
    const props = {
      field: { id: 'f1' },
      idx: 0,
      nestIndex: 0,
      watched: { visitDate: '2026-01-01', recurrence: 'weekly', notes: 'abc' },
      collapsed: true,
      toggleCollapse,
      remove,
      register: () => ({}),
      createCalendarInvite: () => '',
      calendarError: {},
      setCalendarError: jest.fn(),
      collapseAll: () => { },
      minDateStr: '2026-01-01',
      styles: baseStyles,
    };

    const { getByText } = render(<Visit {...props} />);
    const button = getByText('abc').closest('[role="button"]');
    fireEvent.click(button);
    expect(toggleCollapse).toHaveBeenCalledWith(0);
    expect(getByText('abc')).toBeTruthy();
  });

  it('renders expanded view, remove and calendar error behavior', () => {
    const remove = jest.fn();
    const setCalendarError = jest.fn();
    const props = {
      field: { id: 'f2' },
      idx: 1,
      nestIndex: 0,
      watched: { visitDate: '', time: '', notes: '' },
      collapsed: false,
      toggleCollapse: () => { },
      remove,
      register: () => ({}),
      createCalendarInvite: () => '',
      calendarError: { 1: true },
      setCalendarError,
      collapseAll: () => { },
      minDateStr: '2026-01-01',
      styles: baseStyles,
    };

    const { getByLabelText, getByText } = render(<Visit {...props} />);
    const removeBtn = getByLabelText('Remove visit 2');
    fireEvent.click(removeBtn);
    expect(remove).toHaveBeenCalledWith(1);

    const addAnchor = getByText('Add to Google Calendar');
    fireEvent.click(addAnchor);
    expect(setCalendarError).toHaveBeenCalled();

    expect(getByText(c => c.includes('Are required to create a calendar invite.'))).toBeTruthy();
  });
});
