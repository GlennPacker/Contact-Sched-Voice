import { dailyHoursValid, saveVisitToCalendar, updateFutureCalendarDates } from './calendarService.js';

jest.mock('./supabaseClient', () => ({ supabase: { from: jest.fn() } }));
const { supabase } = require('./supabaseClient.js');

function makeFrom(obj) {
  let query = { date: null };
  const chain = {
    update: () => chain,
    select: () => chain,
    eq: (field, value) => {
      if (field === 'date') query.date = value;
      if (field === 'id') query.id = value;
      if (field === 'visitId') query.visitId = value;
      return chain;
    },
    gte: () => chain,
    in: () => Promise.resolve({ data: obj, error: null }),
    insert: rows => ({ select: () => ({ single: () => Promise.resolve({ data: rows[0], error: null }) }) }),
    single: () => {
      if (query.id !== undefined) {
        const found = obj.find(row => row.id === query.id);
        return Promise.resolve({ data: found, error: null });
      }
      return Promise.resolve({ data: obj[0], error: null });
    },
    then: resolve => {
      if (query.date) {
        const filtered = obj.filter(row => row.date === query.date);
        resolve({ data: filtered, error: null });
      } else {
        resolve({ data: obj, error: null });
      }
    }
  };
  return chain;
}

describe('calendarService validation and save', () => {
  const useCases = [
    { name: 'no existing, incoming full day', existing: [], incoming: { visitDate: '2026-03-01', time: 'full day' }, expected: true },
    { name: 'no existing, incoming half day', existing: [], incoming: { visitDate: '2026-03-02', time: '1/2 day' }, expected: true },
    { name: 'no existing, incoming 2 hours', existing: [], incoming: { visitDate: '2026-03-03', time: '2 hours' }, expected: true },
    { name: 'existing full day, incoming 2 hours equals 9', existing: [{ visitId: 1, date: '2026-01-01', time: 'full day' }], incoming: { visitDate: '2026-01-01', time: '2 hours' }, expected: true },
    { name: 'existing full day, incoming half day exceeds 9', existing: [{ visitId: 2, date: '2026-01-04', time: 'full day' }], incoming: { visitDate: '2026-01-04', time: '1/2 day' }, expected: false },
    { name: 'existing half day, incoming full day exceeds 9', existing: [{ visitId: 3, date: '2026-01-05', time: '1/2 day' }], incoming: { visitDate: '2026-01-05', time: 'full day' }, expected: false },
    { name: 'two half days (7h) plus incoming 2 hours equals 9', existing: [{ visitId: 4, date: '2026-01-06', time: '1/2 day' }, { visitId: 5, date: '2026-01-06', time: '1/2 day' }], incoming: { visitDate: '2026-01-06', time: '2 hours' }, expected: true },
    { name: 'half day + 2 hours (5.5h) plus incoming full day exceeds 9', existing: [{ visitId: 6, date: '2026-01-07', time: '1/2 day' }, { visitId: 7, date: '2026-01-07', time: '2 hours' }], incoming: { visitDate: '2026-01-07', time: 'full day' }, expected: false },
    { name: 'existing full day + 2 hours (9h) incoming 2 hours rejects', existing: [{ visitId: 8, date: '2026-01-08', time: 'full day' }, { visitId: 9, date: '2026-01-08', time: '2 hours' }], incoming: { visitDate: '2026-01-08', time: '2 hours' }, expected: false },
    { name: 'existing 2.5 days (17.5h) incoming 2 hours rejects', existing: [{ visitId: 10, date: '2026-02-01', time: 'full day' }, { visitId: 11, date: '2026-02-01', time: 'full day' }, { visitId: 12, date: '2026-02-01', time: '1/2 day' }], incoming: { visitDate: '2026-02-01', time: '2 hours' }, expected: false }
  ];

  it.each(useCases)('Use case: $name', async ({ existing, incoming, expected }) => {
    supabase.from.mockImplementation(() => makeFrom(existing));
    const ok = await dailyHoursValid(incoming);
    expect(ok).toBe(expected);
  });

  it('saves a visit row', async () => {
    supabase.from.mockImplementation(() => makeFrom([]));
    const res = await saveVisitToCalendar({ id: 5, visitDate: '2026-01-01', time: '2 hours' });
    expect(res).toEqual(expect.objectContaining({ visitId: 5, date: '2026-01-01', time: '2 hours' }));
  });
});

describe('updateFutureCalendarDates', () => {
  it('handles empty array from listAllByVisitId', async () => {
    const updateCalendarDate = jest.fn(() => Promise.resolve());
    jest.spyOn(require('./calendarService.js'), 'listAllByVisitId').mockResolvedValue([]);
    jest.spyOn(require('./calendarService.js'), 'updateCalendarDate').mockImplementation(updateCalendarDate);
    await expect(updateFutureCalendarDates(1, 2, '2026-01-13')).resolves.not.toThrow();
    expect(updateCalendarDate).not.toHaveBeenCalled();
  });
});

describe('calendarService destructive and API methods', () => {
  it('deletes a calendar row by visitId and date', async () => {
    supabase.from.mockImplementation(() => ({
      delete: () => ({ match: () => ({ error: null }) })
    }));
    await expect(
      require('./calendarService.js').deleteCalendarRow(1, '2026-01-13')
    ).resolves.toBeUndefined();
  });

  it('throws error if deleteCalendarRow fails', async () => {
    supabase.from.mockImplementation(() => ({
      delete: () => ({ match: () => ({ error: { message: 'fail' } }) })
    }));
    await expect(
      require('./calendarService.js').deleteCalendarRow(1, '2026-01-13')
    ).rejects.toThrow('fail');
  });

  it('deletes calendar rows by visitId array', async () => {
    supabase.from.mockImplementation(() => ({
      delete: () => ({ in: () => ({ error: null }) })
    }));
    await expect(
      require('./calendarService.js').deleteById([1, 2])
    ).resolves.toBeUndefined();
  });

  it('throws error if deleteById fails', async () => {
    supabase.from.mockImplementation(() => ({
      delete: () => ({ in: () => ({ error: { message: 'fail' } }) })
    }));
    await expect(
      require('./calendarService.js').deleteById([1, 2])
    ).rejects.toThrow('fail');
  });

  it('lists all by visitId from a date', async () => {
    jest.resetModules();
    jest.mock('./supabaseClient', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            eq: () => ({
              gte: () => ({ data: [{ id: 1 }], error: null })
            })
          })
        })
      }
    }));
    const calendarService = require('./calendarService.js');
    const result = await calendarService.listAllByVisitId(1, '2026-01-13');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('throws error if listAllByVisitId fails', async () => {
    jest.resetModules();
    jest.mock('./supabaseClient', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            eq: () => ({
              gte: () => ({ data: null, error: { message: 'fail' } })
            })
          })
        })
      }
    }));
    const calendarService = require('./calendarService.js');
    await expect(
      calendarService.listAllByVisitId(1, '2026-01-13')
    ).rejects.toMatchObject({ message: 'fail' });
  });

  it('calls moveVisitApi and returns json', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    }));
    const result = await require('./calendarService.js').moveVisitApi({ calendarId: 1, visitId: 1, newDate: '2026-01-14', moveFuture: false, originalDate: '2026-01-13' });
    expect(result).toEqual({ success: true });
  });

  it('throws error if moveVisitApi fails', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'fail' })
    }));
    await expect(
      require('./calendarService.js').moveVisitApi({ calendarId: 1, visitId: 1, newDate: '2026-01-14', moveFuture: false, originalDate: '2026-01-13' })
    ).rejects.toThrow('fail');
  });
});
