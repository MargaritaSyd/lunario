import { addDaysKey, type DateKey } from './dates';
import { predict, sortCycles, type Cycle, type PredictionSettings } from './predict';

export type DayContext = {
  currentPeriod: boolean;
  pastPeriod: boolean;
  ovulation: boolean;
  fertile: boolean;
  beforeBleeding: boolean;
  afterBleeding: boolean;
};

const LUTEAL_DAYS = 14;
const FERTILE_DAYS_BEFORE = 5;
const FERTILE_DAYS_AFTER = 1;

/**
 * Where a calendar day sits in a cycle, so notes can be added on bleeding days,
 * around them, at ovulation, and in the fertile window.
 */
export function dayContext(
  cycles: Cycle[],
  settings: PredictionSettings,
  today: DateKey,
  date: DateKey,
): DayContext {
  const empty: DayContext = {
    currentPeriod: false,
    pastPeriod: false,
    ovulation: false,
    fertile: false,
    beforeBleeding: false,
    afterBleeding: false,
  };
  const sorted = sortCycles(cycles);
  const latest = sorted[sorted.length - 1];
  if (!latest) return empty;

  const previous = [...sorted].reverse().find((cycle) => cycle.startDate <= date);
  const bleeding =
    previous != null &&
    (previous.endDate
      ? date <= previous.endDate
      : previous.startDate === latest.startDate && date <= today);
  const currentPeriod = Boolean(bleeding && previous && !previous.endDate && previous.startDate === latest.startDate);
  const pastPeriod = bleeding && !currentPeriod;

  const following = sorted.find((cycle) => cycle.startDate > date);
  const prediction = predict(cycles, settings, today);
  const nextStart = following?.startDate ?? prediction?.nextStart ?? null;
  if (!nextStart) {
    return { ...empty, currentPeriod, pastPeriod };
  }

  if (date >= nextStart) {
    return { ...empty, currentPeriod, pastPeriod, beforeBleeding: !bleeding };
  }

  const ovulationDate = addDaysKey(nextStart, -LUTEAL_DAYS);
  const fertileStart = addDaysKey(ovulationDate, -FERTILE_DAYS_BEFORE);
  const fertileEnd = addDaysKey(ovulationDate, FERTILE_DAYS_AFTER);
  const ovulation = date === ovulationDate;
  const fertile = date >= fertileStart && date <= fertileEnd;
  const bleedingEnd = previous?.endDate ?? null;
  const afterBleeding = Boolean(!bleeding && bleedingEnd && date > bleedingEnd && date < fertileStart);
  const beforeBleeding = !bleeding && !fertile && !afterBleeding && date > fertileEnd;

  return { currentPeriod, pastPeriod, ovulation, fertile, beforeBleeding, afterBleeding };
}
