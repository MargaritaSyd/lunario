import type { DateKey } from './dates';

const DAY = Math.PI / 180;

/** Mean synodic month, in days. */
const SYNODIC_MONTH = 29.530588853;

export type MoonPhase = 'new' | 'waxing' | 'full' | 'waning';

/** Julian day at 00:00 UT for a calendar date. */
function julianDay(date: DateKey): number {
  let year = Number(date.slice(0, 4));
  let month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const century = Math.floor(year / 100);
  const gregorian = 2 - century + Math.floor(century / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    gregorian -
    1524.5
  );
}

function wrap360(degrees: number): number {
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/**
 * Days since the new moon, from the difference of the Moon and Sun longitudes
 * (Meeus, low precision). Sampled at noon UT.
 */
export function moonAge(date: DateKey): number {
  const days = julianDay(date) + 0.5 - 2451545;
  const sunAnomaly = wrap360(357.529 + 0.98560028 * days);
  const sunLongitude = wrap360(
    280.459 + 0.98564736 * days + 1.915 * Math.sin(sunAnomaly * DAY) + 0.02 * Math.sin(2 * sunAnomaly * DAY),
  );
  const moonAnomaly = wrap360(134.963 + 13.064993 * days);
  const moonLongitude = wrap360(218.316 + 13.176396 * days + 6.289 * Math.sin(moonAnomaly * DAY));
  return (wrap360(moonLongitude - sunLongitude) / 360) * SYNODIC_MONTH;
}

/**
 * New and full are the days whose noon is within half a day of that phase.
 * The days between are waxing, then waning.
 */
export function moonPhase(date: DateKey): MoonPhase {
  const age = moonAge(date);
  const fromNew = Math.min(age, SYNODIC_MONTH - age);
  const fromFull = Math.abs(age - SYNODIC_MONTH / 2);
  if (fromNew <= 0.5) return 'new';
  if (fromFull <= 0.5) return 'full';
  if (age < SYNODIC_MONTH / 2) return 'waxing';
  return 'waning';
}
