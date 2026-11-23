/**
 * Helpers for calendar dates exchanged with the API as ISO dates ("2026-12-12").
 *
 * Stay dates and birth dates are calendar days, not instants: they are always
 * read and written in the user's local time zone so a date never shifts by a
 * day across time zones.
 */

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** Formats a local date as an ISO date, e.g. 12 Dec 2026 → "2026-12-12". */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses an ISO date as a local date at midnight. */
export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Today's local date as an ISO date. */
export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

/** Adds whole days to an ISO date. */
export function addDaysToIsoDate(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Number of nights between two ISO dates (check-out minus check-in). */
export function nightsBetween(checkInDate: string, checkOutDate: string): number {
  return Math.round(
    (parseIsoDate(checkOutDate).getTime() - parseIsoDate(checkInDate).getTime()) /
      MILLISECONDS_PER_DAY,
  );
}

/** Age in whole years on `onDate` of someone born on `dateOfBirth` (both ISO dates). */
export function ageOn(dateOfBirth: string, onDate: string): number {
  const birth = parseIsoDate(dateOfBirth);
  const day = parseIsoDate(onDate);
  const hadBirthday =
    day.getMonth() > birth.getMonth() ||
    (day.getMonth() === birth.getMonth() && day.getDate() >= birth.getDate());
  return day.getFullYear() - birth.getFullYear() - (hadBirthday ? 0 : 1);
}
