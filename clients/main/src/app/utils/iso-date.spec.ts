import { addDaysToIsoDate, ageOn, nightsBetween, parseIsoDate, toIsoDate } from './iso-date';

describe('iso-date', () => {
  it('formats and parses local calendar dates without shifting the day', () => {
    expect(toIsoDate(new Date(2026, 11, 5))).toBe('2026-12-05');
    const parsed = parseIsoDate('2026-12-05');
    expect([parsed.getFullYear(), parsed.getMonth(), parsed.getDate()]).toEqual([2026, 11, 5]);
  });

  it('adds days across month and year ends', () => {
    expect(addDaysToIsoDate('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDaysToIsoDate('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts nights, also across a daylight saving change', () => {
    expect(nightsBetween('2026-12-12', '2026-12-15')).toBe(3);
    expect(nightsBetween('2026-03-27', '2026-03-30')).toBe(3);
  });

  it('computes the age in whole years', () => {
    expect(ageOn('1990-05-17', '2026-05-16')).toBe(35);
    expect(ageOn('1990-05-17', '2026-05-17')).toBe(36);
  });
});
