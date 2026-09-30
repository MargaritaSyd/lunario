import { addDaysKey, diffDays, type DateKey } from './dates';

/**
 * Estimates the next period from logged cycles.
 * Cycle length is the rounded average of the last 6 complete cycles.
 * Ovulation is 14 days before that next period.
 * The fertile window runs from 5 days before ovulation through 1 day after.
 * If the expected period has passed and none was logged, the date stays put.
 */

export type Cycle = {
  startDate: DateKey;
  endDate: DateKey | null;
};

export type PredictionSettings = {
  cycleLength: number;
  periodLength: number;
  showFertileWindow: boolean;
};

export type Prediction = {
  cycleLength: number;
  periodLength: number;
  nextStart: DateKey;
  late: boolean;
  daysLate: number;
  ovulation: DateKey;
  fertileStart: DateKey;
  fertileEnd: DateKey;
  predictedStart: DateKey;
  predictedEnd: DateKey;
};

export type DayMark = {
  period: boolean;
  predicted: boolean;
  ovulation: boolean;
  fertile: boolean;
};

const COMPLETE_CYCLE_WINDOW = 6;
const LUTEAL_DAYS = 14;
const FERTILE_DAYS_BEFORE = 5;
const FERTILE_DAYS_AFTER = 1;

export function sortCycles(cycles: Cycle[]): Cycle[] {
  return [...cycles].sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0));
}

export function completeCycleLengths(cycles: Cycle[]): number[] {
  const sorted = sortCycles(cycles);
  const lengths: number[] = [];
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const length = diffDays(sorted[index + 1].startDate, sorted[index].startDate);
    if (length > 0) lengths.push(length);
  }
  return lengths.slice(-COMPLETE_CYCLE_WINDOW);
}

export function closedBleedingLengths(cycles: Cycle[]): number[] {
  const lengths: number[] = [];
  for (const cycle of cycles) {
    if (!cycle.endDate) continue;
    const length = diffDays(cycle.endDate, cycle.startDate) + 1;
    if (length > 0) lengths.push(length);
  }
  return lengths;
}

function roundedAverage(values: number[], fallback: number): number {
  if (values.length === 0) return fallback;
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round(sum / values.length);
}

function inRange(date: DateKey, start: DateKey, end: DateKey): boolean {
  return date >= start && date <= end;
}

export function predict(
  cycles: Cycle[],
  settings: PredictionSettings,
  today: DateKey,
): Prediction | null {
  const sorted = sortCycles(cycles);
  const last = sorted[sorted.length - 1];
  if (!last) return null;

  const cycleLength = roundedAverage(completeCycleLengths(sorted), settings.cycleLength);
  const periodLength = roundedAverage(closedBleedingLengths(sorted), settings.periodLength);
  const nextStart = addDaysKey(last.startDate, cycleLength);
  const ovulation = addDaysKey(nextStart, -LUTEAL_DAYS);
  const late = nextStart < today;

  return {
    cycleLength,
    periodLength,
    nextStart,
    late,
    daysLate: late ? diffDays(today, nextStart) : 0,
    ovulation,
    fertileStart: addDaysKey(ovulation, -FERTILE_DAYS_BEFORE),
    fertileEnd: addDaysKey(ovulation, FERTILE_DAYS_AFTER),
    predictedStart: nextStart,
    predictedEnd: addDaysKey(nextStart, periodLength - 1),
  };
}

export function markDay(
  cycles: Cycle[],
  settings: PredictionSettings,
  today: DateKey,
  date: DateKey,
): DayMark {
  const prediction = predict(cycles, settings, today);
  let period = false;

  for (const cycle of cycles) {
    if (cycle.endDate && inRange(date, cycle.startDate, cycle.endDate)) {
      period = true;
    } else if (!cycle.endDate && cycle.startDate <= today && inRange(date, cycle.startDate, today)) {
      period = true;
    }
  }

  let predicted = false;
  if (prediction && !period) {
    const sorted = sortCycles(cycles);
    const last = sorted[sorted.length - 1];
    if (last && !last.endDate && last.startDate <= today) {
      const expectedEnd = addDaysKey(last.startDate, prediction.periodLength - 1);
      const tailStart = addDaysKey(today, 1);
      if (tailStart <= expectedEnd && inRange(date, tailStart, expectedEnd)) predicted = true;
    }
    if (inRange(date, prediction.predictedStart, prediction.predictedEnd)) predicted = true;
  }

  return {
    period,
    predicted,
    ovulation: prediction?.ovulation === date,
    fertile: Boolean(
      settings.showFertileWindow &&
        prediction &&
        inRange(date, prediction.fertileStart, prediction.fertileEnd),
    ),
  };
}
