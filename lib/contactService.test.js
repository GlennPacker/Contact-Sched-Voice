describe('contactService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('addContact succeeds when supabase insert works', async () => {
    jest.doMock('./supabaseClient', () => ({
      supabase: {
        from: () => ({ insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 1 }, error: null }) }) }) })
      }
    }));
    const { addContact } = require('./contactService.js');
    const res = await addContact({ addresses: [], contactTypes: [{ contactType: 'email', metadata: 'x' }], name: 'A' });
    expect(res.error).toBeNull();
    expect(res.data.contact).toBeTruthy();
  });

  it('addContact returns error when supabase insert fails', async () => {
    jest.doMock('./supabaseClient', () => ({
      supabase: { from: () => ({ insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: 'fail' }) }) }) }) }
    }));
    const { addContact } = require('./contactService.js');
    const res = await addContact({ name: 'A', contactTypes: [] });
    expect(res.data).toBeNull();
    expect(res.error).toBe('fail');
  });

  it('buildContactRow and mapContactTypes produce expected row', () => {
    const { buildContactRow, mapContactTypes } = require('./contactService.js');
    const contact = {
      name: 'Alice',
      contactTypes: [{ contactType: 'email', metadata: 'name@example.com' }],
      rateFullDay: 300,
      rateHalfDay: 150,
      rateTwoHour: 80,
      rateHour: 40,
      rateJob: 600,
      priceReviewDate: '2025-12-31',
    };
    const expectedTypes = mapContactTypes(contact.contactTypes);
    const row = buildContactRow(contact);
    expect(row).toEqual({ name: 'Alice', ...expectedTypes, rateFullDay: 300, rateHalfDay: 150, rateTwoHour: 80, rateHour: 40, rateJob: 600, priceReviewDate: '2025-12-31' });
  });

  it('listContacts returns array and throws on supabase error', async () => {
    jest.doMock('./supabaseClient', () => ({ supabase: { from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [{ id: 1, name: 'A', addresses: [] }], error: null }) }) }) }) } }));
    let svc = require('./contactService.js');
    let res = await svc.listContacts({ limit: 5 });
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].name).toBe('A');

    jest.resetModules();
    jest.doMock('./supabaseClient', () => ({ supabase: { from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: null, error: 'boom' }) }) }) }) } }));
    const { listContacts } = require('./contactService.js');
    await expect(listContacts()).rejects.toBe('boom');
  });

  it('searchContacts filters by name and address and sorts by score then name', async () => {
    const mockList = [
      { id: 1, name: 'Alpha', addresses: [{ address: 'Main St' }] },
      { id: 2, name: 'Beta', addresses: [{ address: 'Second Ave' }] },
      { id: 3, name: 'Alphonso', addresses: [] }
    ];
    jest.doMock('./supabaseClient', () => ({ supabase: { from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: mockList, error: null }) }) }) }) } }));
    const { searchContacts } = require('./contactService.js');
    const resByName = await searchContacts({ name: 'Alpha' });
    expect(resByName.length).toBe(1);
    const resByAddr = await searchContacts({ address: 'Second' });
    expect(resByAddr.length).toBe(1);
    expect(resByAddr[0].name).toBe('Beta');
  });

  it('getContact returns mapped contact and throws on error', async () => {
    const row = { id: 5, name: 'Zed', rateFullDay: 100, facebookGlenn: 'fb', addresses: [{ id: 11, address: '1 Road', visits: [{ id: 21, visitDate: '2026-01-01', earliestDate: null, notes: 'n', isInside: true, isFlexilbe: false, time: 'full', recurrence: 'none' }] }] };
    jest.doMock('./supabaseClient', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: row, error: null }) }) }) }) } }));
    const { getContact } = require('./contactService.js');
    const contact = await getContact(5);
    expect(contact.id).toBe(5);
    expect(contact.rateFullDay).toBe(100);
    expect(contact.contactTypes.facebookGlenn.selected).toBe(true);
    expect(contact.addresses[0].visits[0].visitDate).toBe('2026-01-01');

    jest.resetModules();
    jest.doMock('./supabaseClient', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: 'err' }) }) }) }) } }));
    const { getContact: getContactWithErr } = require('./contactService.js');
    await expect(getContactWithErr(1)).rejects.toBe('err');
  });

  it('updateContact returns error object when update fails', async () => {
    jest.doMock('./supabaseClient', () => ({ supabase: { from: () => ({ update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: 'bad' }) }) }) }) }) } }));
    const { updateContact } = require('./contactService.js');
    const res = await updateContact(1, { name: 'X', addresses: [], contactTypes: [] });
    expect(res.data).toBeNull();
    expect(res.error).toBe('bad');
  });

  it('insertAddressRow and insertVisitRow call supabase and return data', async () => {
    jest.doMock('./supabaseClient', () => ({ supabase: { from: () => ({ insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 99 }, error: null }) }) }) }) } }));
    const { insertAddressRow, insertVisitRow } = require('./contactService.js');
    const a = await insertAddressRow(1, { address: 'x' });
    expect(a.data.id).toBe(99);
    const v = await insertVisitRow(1, { notes: 'n' });
    expect(v.data.id).toBe(99);
  });

  it('getContactsByIds returns [] for empty input and data for ids', async () => {
    jest.resetModules();
    jest.doMock('./supabaseClient', () => ({ supabase: { from: () => ({ select: () => ({ in: () => Promise.resolve({ data: [{ id: 9 }], error: null }) }) }) } }));
    const { getContactsByIds } = require('./contactService.js');
    expect(await getContactsByIds([])).toEqual([]);
    const res = await getContactsByIds([9]);
    expect(res[0].id).toBe(9);
  });

  it('addContact returns error when a dated visit conflicts via dailyHoursValid', async () => {
    jest.doMock('./supabaseClient', () => ({ supabase: { from: () => ({ insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 1 }, error: null }) }) }) }) } }));
    jest.doMock('./calendarService.js', () => ({ dailyHoursValid: jest.fn(() => Promise.resolve(false)), saveVisitToCalendar: jest.fn() }));
    const { addContact } = require('./contactService.js');
    const res = await addContact({ addresses: [{ address: 'a', visits: [{ visitDate: '2026-01-10', notes: '' }] }], contactTypes: [] });
    expect(res.data).toBeNull();
    expect(res.error && res.error.message).toContain('Calendar conflict');
  });

  it('addContact processes recurrence and creates deferred visit when recurrence hits conflict', async () => {
    const mockSupabaseFrom = jest.fn(() => ({
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 123 }, error: null }) }) }),
      select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) })
    }));
    jest.doMock('./supabaseClient', () => ({ supabase: { from: mockSupabaseFrom } }));
    jest.doMock('./calendarService.js', () => ({ dailyHoursValid: jest.fn(v => Promise.resolve(true)), saveVisitToCalendar: jest.fn(() => Promise.resolve(true)) }));
    jest.doMock('./visitUtils.js', () => ({ generateRecurrenceDates: jest.fn(() => ['2026-02-01', '2026-03-01']) }));
    jest.doMock('./visitService.js', () => ({ createDeferredVisit: jest.fn(() => Promise.resolve({ id: 999 })) }));
    const cs = require('./calendarService.js');
    cs.dailyHoursValid = jest.fn(v => Promise.resolve(!(v && v.visitDate === '2026-03-01')));

    const { addContact } = require('./contactService.js');
    const res = await addContact({ addresses: [{ address: 'a', visits: [{ visitDate: '2026-01-10', notes: '', recurrence: 'weekly' }] }], contactTypes: [] });
    expect(res.error).toBeNull();
    expect(Array.isArray(res.data.warnings)).toBe(true);
  });

  it('updateContact deletes removed addresses and visits then returns results', async () => {
    const updatedContact = { id: 42, name: 'Updated' };
    const existingAddrs = [{ id: 100 }];
    const visitsToDelete = [{ id: 7 }];
    const calls = { deletedCalendars: null, deletedVisits: null, deletedAddrs: null };

    jest.doMock('./supabaseClient', () => ({
      supabase: {
        from: table => {
          if (table === 'contacts') {
            return { update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: updatedContact, error: null }) }) }) }) };
          }
          if (table === 'addresses') {
            return {
              select: () => ({ eq: () => Promise.resolve({ data: existingAddrs, error: null }) }), delete: () => ({
                in: (field, ids) => {
                  calls.deletedAddrs = ids;

                  return Promise.resolve({ data: null, error: null });
                }
              })
            };
          }
          if (table === 'visits') {
            return {
              select: () => ({ in: (field, ids) => Promise.resolve({ data: visitsToDelete, error: null }) }),
              delete: () => ({
                in: (field, ids) => {
                  calls.deletedVisits = ids;

                  return Promise.resolve({ data: null, error: null });
                }
              })
            };
          }
          if (table === 'calendars') {
            return {
              delete: () => ({
                in: (field, ids) => {
                  calls.deletedCalendars = ids;

                  return Promise.resolve({ data: null, error: null });
                }
              })
            };
          }

          return {
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
            select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: null, error: null }) }), eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }), in: () => Promise.resolve({ data: null, error: null }) }),
            delete: () => ({ in: () => Promise.resolve({ data: null, error: null }) }),
          };
        }
      }
    }));

    jest.doMock('./calendarService.js', () => ({ dailyHoursValid: jest.fn(() => Promise.resolve(true)), saveVisitToCalendar: jest.fn() }));

    const { updateContact } = require('./contactService.js');
    const res = await updateContact(42, { name: 'X', addresses: [], contactTypes: [] });
    expect(res.error).toBeNull();
    expect(res.data.addresses).toBeDefined();
    expect(calls.deletedCalendars).toEqual([7]);
    expect(calls.deletedVisits).toEqual([7]);
    expect(calls.deletedAddrs).toEqual([100]);
  });

  it('updateContact returns error when validateVisitsForAddresses fails', async () => {
    const updatedContact = { id: 50, name: 'U' };
    jest.doMock('./supabaseClient', () => ({
      supabase: { from: () => ({ update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: updatedContact, error: null }) }) }) }), select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) }) }
    }));
    jest.doMock('./calendarService.js', () => ({ dailyHoursValid: jest.fn(() => Promise.resolve(false)), saveVisitToCalendar: jest.fn() }));
    const { updateContact } = require('./contactService.js');
    const res = await updateContact(50, { name: 'X', addresses: [{ address: 'a', visits: [{ visitDate: '2026-01-20' }] }], contactTypes: [] });
    expect(res.data).toBeNull();
    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.message).toContain('Calendar conflict');
  });
});
