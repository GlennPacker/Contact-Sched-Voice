import * as service from './contactService.js';

jest.mock('./supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: 'inserted', error: null }))
        }))
      }))
    }))
  }
}));

describe('addContact', () => {
  it('adds contact', async () => {
    const res = await service.addContact({
      addresses: [],
      contactTypes: [{
        contactType: 'email',
        metadata: 'x'
      }],
      name: 'A',
      priceReviewDate: '2025-12-23',
      rates: {
        fullDay: 100
      }
    });
      expect(res.data.contact).toBe('inserted');
      expect(res.data.addresses).toEqual([]);
      expect(res.data.visits).toEqual([]);
    expect(res.error).toBeNull();
  });

  it('returns supabase error if insert fails', async () => {
    jest.resetModules();
    jest.doMock('./supabaseClient', () => ({
      supabase: {
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: 'fail' }))
            }))
          }))
        }))
      }
    }));
    const { addContact: addContactWithError } = require('./contactService.js');
    const res = await addContactWithError({ name: 'A', contactTypes: [] });
    expect(res.data).toBeNull();
    expect(res.error).toBe('fail');
  });
});

describe('buildContactRow', () => {
  it('merges mapped contact types and top-level camelCase rates into a contact row', () => {
    const contact = {
      name: 'Alice',
      contactTypes: [{ contactType: 'email', metadata: 'name@example.com' }],
      rateFullDay: 300,
      rateHalfDay: 150,
      rateTwoHour: 80,
      rateHour: 40,
      rateJob: 600,
      priceReviewDate: '2025-12-31',
    }

    const expectedTypes = service.mapContactTypes(contact.contactTypes)
    const row = service.buildContactRow(contact)

    expect(row).toEqual({
      name: 'Alice',
      ...expectedTypes,
      rateFullDay: 300,
      rateHalfDay: 150,
      rateTwoHour: 80,
      rateHour: 40,
      rateJob: 600,
      priceReviewDate: '2025-12-31',
    })
  })
})
