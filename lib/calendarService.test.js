import { calcStart, utcToZulu, getEndDate, calcReocurance, contactCreateAppointment } from './calendarService.js';

describe('calendarService', () => {
  describe('calcStart', () => {
    it('returns correct UTC date for non-DST (January)', () => {
      const d = calcStart('2025', '1', '15');
      expect(d.getUTCHours()).toBe(8);
    });
    it('returns correct UTC date for DST (July)', () => {
      const d = calcStart('2025', '7', '15');
      expect(d.getUTCHours()).toBe(7);
    });
  });

  describe('utcToZulu', () => {
    it('formats date to Zulu string', () => {
      const d = new Date(Date.UTC(2025, 0, 2, 9, 5, 7));
      expect(utcToZulu(d)).toBe('20250102T090507Z');
    });
  });

  describe('getEndDate', () => {
    it('adds 7 hours for full day', () => {
      const start = new Date(Date.UTC(2025, 0, 1, 9, 0, 0));
      const end = getEndDate('full day', '', start);
      expect(end.getUTCHours()).toBe(16);
    });
    it('adds 4 hours for half day', () => {
      const start = new Date(Date.UTC(2025, 0, 1, 9, 0, 0));
      const end = getEndDate('1/2 day', '', start);
      expect(end.getUTCHours()).toBe(13);
    });
    it('adds 2 hours for 2 hours', () => {
      const start = new Date(Date.UTC(2025, 0, 1, 9, 0, 0));
      const end = getEndDate('2 hours', '', start);
      expect(end.getUTCHours()).toBe(11);
    });
    it('adds days and sets hour for multiday', () => {
      const start = new Date(Date.UTC(2025, 0, 1, 9, 0, 0));
      const end = getEndDate('multiday', 3, start);
      expect(end.getUTCDate()).toBe(4);
      expect(end.getUTCHours()).toBe(16);
    });
    it('adds 1 hour for default', () => {
      const start = new Date(Date.UTC(2025, 0, 1, 9, 0, 0));
      const end = getEndDate('other', '', start);
      expect(end.getUTCHours()).toBe(10);
    });
  });

  describe('calcReocurance', () => {
    it('returns correct RRULE for 2 weeks', () => {
      expect(calcReocurance('2 weeks')).toBe('RRULE:FREQ=WEEKLY;INTERVAL=2');
    });
    it('returns correct RRULE for 3 weeks', () => {
      expect(calcReocurance('3 weeks')).toBe('RRULE:FREQ=WEEKLY;INTERVAL=3');
    });
    it('returns correct RRULE for 4 weeks (monthly)', () => {
      expect(calcReocurance('4 weeks (monthly)')).toBe('RRULE:FREQ=MONTHLY;INTERVAL=1');
    });
    it('returns empty string for unknown', () => {
      expect(calcReocurance('not a rule')).toBe('');
    });
  });

  describe('contactCreateAppointment', () => {
    it('calls createAppointment with correct arguments and returns its result', () => {
      const mockCreateAppointment = jest.fn().mockReturnValue('mockResult');
      const url = contactCreateAppointment({
        contactName: 'John Doe', visit: {
          date: '2025-07-15',
          note: 'Test note',
          time: 'full day',
          days: '',
          isInside: true,
          recurrence: '2 weeks'
        }, address: 'Paris'
      }, mockCreateAppointment);
      expect(url).toBe('mockResult');
      expect(mockCreateAppointment).toHaveBeenCalledWith(expect.objectContaining({
        title: 'John Doe',
        details: 'Test note',
        location: 'Paris',
        start: expect.any(Date),
        end: expect.any(Date),
        recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=2'
      }));
    });
  });
});
