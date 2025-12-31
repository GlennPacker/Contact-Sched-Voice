import { dailyHoursValid, saveVisitToCalendar } from './calendarService.js'

jest.mock('./supabaseClient', () => ({ supabase: { from: jest.fn() } }))
const { supabase } = require('./supabaseClient.js')

function makeFrom(obj) {
  return {
    select: () => ({ in: () => Promise.resolve({ data: obj, error: null }), eq: () => Promise.resolve({ data: obj, error: null }) }),
    insert: (rows) => ({ select: () => ({ single: () => Promise.resolve({ data: rows[0], error: null }) }) })
  }
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
  ]

  it.each(useCases)('Use case: $name', async ({ existing, incoming, expected }) => {
    supabase.from.mockImplementation(() => makeFrom(existing))
    const ok = await dailyHoursValid(incoming)
    expect(ok).toBe(expected)
  })

  it('saves a visit row', async () => {
    supabase.from.mockImplementation(() => makeFrom([]))
    const res = await saveVisitToCalendar({ id: 5, visitDate: '2026-01-01', time: '2 hours' })
    expect(res).toEqual(expect.objectContaining({ visitId: 5, date: '2026-01-01', time: '2 hours' }))
  })
})
