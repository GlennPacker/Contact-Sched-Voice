import * as svc from './contactFormService'
import * as env from './envService'
const { getDefaultPriceReviewDate, sortVisitsDescending, getDefaultFormValues, computeRateAdjustments, buildPayloadFromForm } = svc

describe('contactFormService', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('getDefaultPriceReviewDate returns a YYYY-MM-DD string six months ahead', () => {
    const val = getDefaultPriceReviewDate()
    expect(typeof val).toBe('string')
    expect(val).toMatch(/\d{4}-\d{2}-\d{2}/)
    const today = new Date()
    const expected = new Date(today.setMonth(today.getMonth() + 6)).toISOString().split('T')[0]
    expect(val).toBe(expected)
  })

  test('getEnvRates reads environment variables and coerces to numbers', () => {
    process.env.NEXT_PUBLIC_RATE_FULL_DAY = '100'
    process.env.NEXT_PUBLIC_RATE_HALF_DAY = '60'
    process.env.NEXT_PUBLIC_RATE_TWO_HOUR = '40'
    process.env.NEXT_PUBLIC_RATE_HOUR = '20'
    process.env.NEXT_PUBLIC_RATE_JOB = '200'
    const rates = env.getEnvRates()
    expect(rates).toEqual({ rateFullDay: 100, rateHalfDay: 60, rateTwoHour: 40, rateHour: 20, rateJob: 200 })
  })

  test('sortVisitsDescending sorts visits per address with latest visitDate first and keeps undefined at end', () => {
    const input = [
      { id: 1, visits: [{ visitDate: '2025-01-01' }, { visitDate: null }, { visitDate: '2025-06-01' }] },
      { id: 2, visits: 'not-an-array' },
    ]
    const out = sortVisitsDescending(input)
    expect(Array.isArray(out)).toBe(true)
    expect(out[0].visits[0].visitDate).toBe('2025-06-01')
    expect(out[0].visits[out[0].visits.length - 1].visitDate).toBeNull()
    expect(out[1].visits).toBe('not-an-array')
  })

  test('getDefaultFormValues uses getEnvRates (spy) and returns defaults when no initial values', () => {
    const spy = jest.spyOn(env, 'getEnvRates').mockReturnValue({
      rateFullDay: 150,
      rateHalfDay: 80,
      rateTwoHour: 50,
      rateHour: 30,
      rateJob: 220,
    })
    const vals = getDefaultFormValues(null)
    expect(vals.addresses).toHaveLength(1)
    expect(vals.rateFullDay).toBe(150)
    expect(vals.rateHalfDay).toBe(80)
    expect(vals.rateTwoHour).toBe(50)
    expect(typeof vals.priceReviewDate).toBe('string')
    spy.mockRestore()
  })

  test('computeRateAdjustments returns updates only when current matches env', () => {
    process.env.NEXT_PUBLIC_RATE_HALF_DAY = '60'
    process.env.NEXT_PUBLIC_RATE_TWO_HOUR = '40'
    const noUpdate = computeRateAdjustments('', 60, 40)
    expect(noUpdate).toEqual({})

    const updates = computeRateAdjustments(120, 60, 40)
    expect(typeof updates).toBe('object')
    expect(updates).toHaveProperty('rateHalfDay')
    expect(updates).toHaveProperty('rateTwoHour')
  })

  test('buildPayloadFromForm converts contactTypes object to array and preserves fields', () => {
    const form = {
      name: 'Alice',
      contactTypes: {
        email: { selected: true, metadata: 'a@example.com' },
        whatsapp: { selected: false },
      },
      rateFullDay: 100,
      rateHalfDay: 60,
      rateTwoHour: 40,
      rateHour: 20,
      rateJob: 200,
      priceReviewDate: '2026-01-01',
      addresses: [{ address: '1 A St' }],
    }
    const payload = buildPayloadFromForm(form)
    expect(payload.name).toBe('Alice')
    expect(payload.rateFullDay).toBe(100)
    expect(payload.rateHalfDay).toBe(60)
    expect(payload.rateTwoHour).toBe(40)
    expect(payload.rateHour).toBe(20)
    expect(payload.rateJob).toBe(200)
    expect(payload.priceReviewDate).toBe('2026-01-01')
    expect(Array.isArray(payload.contactTypes)).toBe(true)
    expect(payload.contactTypes).toEqual([{ contactType: 'email', metadata: 'a@example.com' }])
    expect(payload.addresses).toEqual([{ address: '1 A St' }])
  })
})
