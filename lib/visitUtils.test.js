import * as visitUtils from './visitUtils';
import { VisitTime } from './referenceDataService';

describe('visitUtils', () => {
  describe('getVisitEventColor', () => {
    it('returns correct color for TWO_HOUR', () => {
      expect(visitUtils.getVisitEventColor({ time: VisitTime.TWO_HOUR })).toBe('#444');
    });
    it('returns correct color for HALF_DAY', () => {
      expect(visitUtils.getVisitEventColor({ time: VisitTime.HALF_DAY })).toBe('#FF9800');
    });
    it('returns correct color for FULL_DAY', () => {
      expect(visitUtils.getVisitEventColor({ time: VisitTime.FULL_DAY })).toBe('#9C27B0');
    });
    it('returns null for unknown time', () => {
      expect(visitUtils.getVisitEventColor({ time: 'other' })).toBeNull();
    });
  });

  describe('calcStart', () => {
    it('returns a Date object for 2 hours', () => {
      const d = visitUtils.calcStart(2026, 1, 18, '2 hours');
      expect(d).toBeInstanceOf(Date);
    });
    it('returns a Date object for full day', () => {
      const d = visitUtils.calcStart(2026, 1, 18, 'full day');
      expect(d).toBeInstanceOf(Date);
    });
  });

  describe('utcToZulu', () => {
    it('formats date to Zulu string', () => {
      const d = new Date(Date.UTC(2026, 0, 18, 8, 5, 9));
      expect(visitUtils.utcToZulu(d)).toBe('20260118T080509Z');
    });
  });

  describe('createAppointment', () => {
    it('generates a Google Calendar URL with all params', () => {
      const url = visitUtils.createAppointment({
        title: 'Test',
        details: 'Details',
        location: 'Loc',
        start: new Date(Date.UTC(2026, 0, 18, 8, 0, 0)),
        end: new Date(Date.UTC(2026, 0, 18, 10, 0, 0)),
        colorId: 1,
        recurrence: 'RRULE:FREQ=WEEKLY',
      });
      expect(url).toContain('calendar.google.com/calendar/render?');
      expect(url).toContain('text=Test');
      expect(url).toContain('details=Details');
      expect(url).toContain('location=Loc');
      expect(url).toContain('dates=20260118T080000Z/20260118T100000Z');
      expect(url).toContain('recur=RRULE%3AFREQ%3DWEEKLY');
    });
    it('omits recurrence if not provided', () => {
      const url = visitUtils.createAppointment({
        title: 'Test',
        details: '',
        location: '',
        start: new Date(Date.UTC(2026, 0, 18, 8, 0, 0)),
        end: new Date(Date.UTC(2026, 0, 18, 10, 0, 0)),
      });
      expect(url).not.toContain('recur=');
    });
  });

  describe('getEndDate', () => {
    it('adds 210 minutes for 1/2 day', () => {
      const start = new Date(Date.UTC(2026, 0, 18, 8, 0, 0));
      const end = visitUtils.getEndDate('1/2 day', 0, start);
      expect(end.getUTCHours() * 60 + end.getUTCMinutes()).toBe(8 * 60 + 210);
    });
    it('adds 2 hours for 2 hours', () => {
      const start = new Date(Date.UTC(2026, 0, 18, 8, 0, 0));
      const end = visitUtils.getEndDate('2 hours', 0, start);
      expect(end.getUTCHours()).toBe(10);
    });
    it('adds 7 hours for full day', () => {
      const start = new Date(Date.UTC(2026, 0, 18, 8, 0, 0));
      const end = visitUtils.getEndDate('full day', 0, start);
      expect(end.getUTCHours()).toBe(15);
    });
    it('adds days for multiday', () => {
      const start = new Date(Date.UTC(2026, 0, 18, 8, 0, 0));
      const end = visitUtils.getEndDate('multiday', 2, start);
      expect(end.getUTCDate()).toBe(20);
    });
  });

  describe('calcReocurance', () => {
    it('returns days for known recurrence', () => {
      expect(visitUtils.calcReocurance('2 weeks')).toBe(14);
      expect(visitUtils.calcReocurance('3 weeks')).toBe(21);
      expect(visitUtils.calcReocurance('4 weeks (monthly)')).toBe(28);
    });
    it('returns empty string for unknown', () => {
      expect(visitUtils.calcReocurance('none')).toBe('');
    });
  });

  describe('generateRecurrenceDates', () => {
    it('returns empty array if no recurrence', () => {
      expect(visitUtils.generateRecurrenceDates({})).toEqual([]);
    });
    it('generates correct recurrence dates', () => {
      const visit = { visitDate: '2026-01-01', recurrence: '2 weeks' };
      const dates = visitUtils.generateRecurrenceDates(visit);
      expect(dates[0]).toBe('2026-01-15');
      expect(dates.length).toBeGreaterThan(20);
    });
  });

  describe('contactCreateAppointment', () => {
    it('returns empty string if visit is missing', () => {
      expect(visitUtils.contactCreateAppointment({ contactName: 'A', visit: null, address: 'B' })).toBe('');
    });
    it('calls createAppointmentFn with correct args', () => {
      const mockFn = jest.fn();
      visitUtils.contactCreateAppointment({
        contactName: 'A',
        visit: { visitDate: '2026-01-18', time: 'full day', notes: 'N', days: 1, recurrence: '2 weeks' },
        address: 'B',
      }, mockFn);
      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'A',
          details: 'N',
          location: 'B',
        })
      );
    });
  });

});
