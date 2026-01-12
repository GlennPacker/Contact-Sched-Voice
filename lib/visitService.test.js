const mockFrom = jest.fn()

jest.mock('./supabaseClient', () => ({
  supabase: { from: mockFrom },
}))

const { listVisits, listUnscheduledVisits, createDeferredVisit } = require('./visitService')

describe('visitService', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  function createChain(result) {
    const chain = {
      select: jest.fn(() => chain),
      gte: jest.fn(() => chain),
      order: jest.fn(() => chain),
      limit: jest.fn(() => Promise.resolve(result)),
      is: jest.fn(() => Promise.resolve(result)),
      insert: jest.fn(() => ({
        select: () => ({
          single: () => Promise.resolve(result),
        }),
      })),
    }

    return chain
  }

  test('listVisits maps calendar rows to visits', async () => {
    const data = [
      {
        date: '2026-01-10',
        visitId: 'v1',
        visits: {
          id: 11,
          addressId: 22,
          visitDate: '2026-01-10',
          time: 'morning',
          notes: 'note',
          isInside: false,
          recurrence: null,
        },
      },
    ]

    mockFrom.mockImplementation(() => createChain({ data, error: null }))

    const res = await listVisits({ fromDate: '2026-01-01', limit: 1, order: 'asc' })

    expect(res).toEqual([
      {
        id: 11,
        addressId: 22,
        visitDate: '2026-01-10',
        time: 'morning',
        notes: 'note',
        isInside: false,
        recurrence: null,
        visitId: 'v1',
      },
    ])

    const returnedChain = mockFrom.mock.results[0].value
    expect(returnedChain.gte).toHaveBeenCalledWith('date', '2026-01-01')
    expect(returnedChain.order).toHaveBeenCalled()
    expect(returnedChain.limit).toHaveBeenCalledWith(1)
  })

  test('listVisits throws when supabase returns error', async () => {
    mockFrom.mockImplementation(() => createChain({ data: null, error: new Error('boom') }))

    await expect(listVisits()).rejects.toThrow('boom')
  })

  test('listUnscheduledVisits maps visits correctly', async () => {
    const data = [
      {
        id: 5,
        addressId: 9,
        visitDate: null,
        time: 'afternoon',
        notes: 'n',
        isInside: true,
        recurrence: 'weekly',
        earliestDate: '2026-02-01',
      },
    ]

    mockFrom.mockImplementation(() => createChain({ data, error: null }))

    const res = await listUnscheduledVisits()

    expect(res).toEqual([
      {
        id: 5,
        addressId: 9,
        visitDate: null,
        time: 'afternoon',
        notes: 'n',
        isInside: true,
        recurrence: 'weekly',
        earliestDate: '2026-02-01',
      },
    ])
  })

  test('createDeferredVisit returns created data and pushes warning on success', async () => {
    const returned = { id: 123 }
    mockFrom.mockImplementation(() => ({
      insert: jest.fn(() => ({
        select: () => ({
          single: () => Promise.resolve({ data: returned, error: null }),
        }),
      })),
    }))

    const warnings = []
    const visitData = { addressId: 7, notes: 'x', isInside: false, isFlexilbe: true, time: 'two-hour', recurrence: null }

    const res = await createDeferredVisit(visitData, '2026-03-01', warnings)

    expect(res).toEqual(returned)
    expect(warnings).toContain('Deferred visit created (id=123) with earliestDate=2026-03-01')
  })

  test('createDeferredVisit pushes warning and returns null on insert error', async () => {
    mockFrom.mockImplementation(() => ({
      insert: jest.fn(() => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'fail' } }),
        }),
      })),
    }))

    const warnings = []
    const visitData = { addressId: 7, notes: 'x', isInside: false, isFlexilbe: true, time: 'two-hour', recurrence: null }

    const res = await createDeferredVisit(visitData, '2026-03-01', warnings)

    expect(res).toBeNull()
    expect(warnings.some(w => w.includes('Failed to create deferred visit'))).toBe(true)
  })

  test('createDeferredVisit handles thrown errors and returns null', async () => {
    mockFrom.mockImplementation(() => ({
      insert: jest.fn(() => ({
        select: () => ({
          single: () => Promise.reject(new Error('bad')),
        }),
      })),
    }))

    const warnings = []
    const visitData = { addressId: 7, notes: 'x', isInside: false, isFlexilbe: true, time: 'two-hour', recurrence: null }

    const res = await createDeferredVisit(visitData, '2026-03-01', warnings)

    expect(res).toBeNull()
    expect(warnings.some(w => w.includes('Failed to create deferred visit'))).toBe(true)
  })
})
