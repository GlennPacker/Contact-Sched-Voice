import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { useForm } from 'react-hook-form';
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

  function VisitWithForm(props) {
    const { control, register } = useForm({
      defaultValues: { addresses: [{ visits: [{}] }] },
    });
    return <Visit {...props} control={control} register={register} />;
  }

  it('renders collapsed summary and toggles collapse on click', async () => {
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

    let utils;
    await act(async () => {
      utils = render(<VisitWithForm {...props} />);
    });
    const { getByText } = utils;
    const button = getByText('abc').closest('[role="button"]');
    fireEvent.click(button);
    expect(toggleCollapse).toHaveBeenCalledWith(0);
    expect(getByText('abc')).toBeTruthy();
  });

  it('renders expanded view, remove and calendar error behavior', async () => {
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

    let utils2;
    await act(async () => {
      utils2 = render(<VisitWithForm {...props} />);
    });
    const { getByLabelText, getByText } = utils2;
    const removeBtn = getByLabelText('Remove visit 2');
    fireEvent.click(removeBtn);
    expect(remove).toHaveBeenCalledWith(1);

    const addAnchor = getByText('Add to Google Calendar');
    fireEvent.click(addAnchor);
    expect(setCalendarError).toHaveBeenCalled();

    expect(getByText(c => c.includes('Are required to create a calendar invite.'))).toBeTruthy();
  });
});
