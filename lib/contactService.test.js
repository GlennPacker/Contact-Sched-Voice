import { addContact } from './contactService.js';

jest.mock('./supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: 'inserted', error: null }))
    }))
  }
}));

describe('addContact', () => {
  it('adds contact', async () => {
    const res = await addContact({ name: 'A', contactTypes: [{ contactType: 'email', metadata: 'x' }], rates: { fullDay: 100 }, priceReviewDate: '2025-12-23' });
    expect(res.data).toBe('inserted');
    expect(res.error).toBeNull();
  });

  it('returns supabase error if insert fails', async () => {
    jest.resetModules();
    jest.doMock('./supabaseClient', () => ({
      supabase: {
        from: jest.fn(() => ({
          insert: jest.fn(() => Promise.resolve({ data: null, error: 'fail' }))
        }))
      }
    }));
    const { addContact: addContactWithError } = require('./contactService.js');
    const res = await addContactWithError({ name: 'A' });
    expect(res.data).toBeNull();
    expect(res.error).toBe('fail');
  });
});
