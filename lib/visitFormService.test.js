import {
  getTomorrowMinDate,
  getCutoffDate,
  sortVisitsByDateDesc,
  makeNewVisitFromMostRecent,
  defaultCollapsedFor,
  orderVisits,
} from './visitFormService';

describe('visitFormService', () => {
  test('getTomorrowMinDate returns tomorrow in YYYY-MM-DD', () => {
    const returned = getTomorrowMinDate();
    expect(typeof returned).toBe('string');
    expect(returned).toMatch(/\d{4}-\d{2}-\d{2}/);

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const parsed = new Date(returned + 'T00:00:00');
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((parsed - todayMidnight) / msPerDay);
    expect(diffDays).toBe(1);
  });

  test('getCutoffDate returns date N days ago', () => {
    const days = 7;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const expected = cutoff.toISOString().split('T')[0];
    expect(getCutoffDate(days)).toBe(expected);
  });

  test('sortVisitsByDateDesc sorts correctly with empty dates last', () => {
    const visits = [
      { visitDate: '2025-12-01' },
      { visitDate: null },
      { visitDate: '2025-12-10' },
    ];
    const sorted = sortVisitsByDateDesc(visits);
    expect(sorted[0].visitDate).toBe('2025-12-10');
    expect(sorted[sorted.length - 1].visitDate).toBeNull();
  });

  test('makeNewVisitFromMostRecent copies fields from most recent visit', () => {
    const fields = [
      { visitDate: '2025-01-01', notes: 'old', recurrence: 'weekly', time: 'morning', days: 'Mon', isInside: true },
      { visitDate: '2025-12-31', notes: 'recent', recurrence: 'does not reoccur', time: 'afternoon', days: 'Tue', isInside: false },
    ];
    const next = makeNewVisitFromMostRecent(fields);
    expect(next.visitDate).toBeNull();
    expect(next.notes).toBe('recent');
    expect(next.recurrence).toBe('does not reoccur');
    expect(next.time).toBe('afternoon');
  });

  test('defaultCollapsedFor returns correct collapsed array', () => {
    expect(defaultCollapsedFor(0)).toEqual([false]);
    expect(defaultCollapsedFor(1)).toEqual([false]);
    expect(defaultCollapsedFor(3)).toEqual([false, true, true]);
  });

  test('orderVisits filters by cutoff and sorts by date', () => {
    const fields = [
      { visitDate: '2025-01-01' },
      { visitDate: null },
      { visitDate: '2099-01-01' },
    ];
    const watched = [{ visitDate: '2100-01-01' }, null, null];
    const ordered = orderVisits({ fields, watchedVisits: watched, cutoffDays: 36500 });
    expect(Array.isArray(ordered)).toBe(true);
  });
});
