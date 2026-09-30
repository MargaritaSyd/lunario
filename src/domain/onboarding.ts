import { isDateKey, type DateKey } from './dates';

export type OnboardingError = 'invalid-date' | 'cycle-length' | 'period-length';

export type OnboardingValue = {
  lastPeriodStart: DateKey;
  cycleLength: number;
  periodLength: number;
};

export type OnboardingResult =
  | { ok: true; value: OnboardingValue }
  | { ok: false; error: OnboardingError };

function parseWholeNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

export function parseOnboarding(
  input: { lastPeriodStart: string; cycleLength: string; periodLength: string },
  today: DateKey,
): OnboardingResult {
  if (!isDateKey(input.lastPeriodStart) || input.lastPeriodStart > today) {
    return { ok: false, error: 'invalid-date' };
  }

  const cycleLength = parseWholeNumber(input.cycleLength);
  if (cycleLength === null || cycleLength < 15 || cycleLength > 90) {
    return { ok: false, error: 'cycle-length' };
  }

  const periodLength = parseWholeNumber(input.periodLength);
  if (periodLength === null || periodLength < 1 || periodLength > 14) {
    return { ok: false, error: 'period-length' };
  }

  return {
    ok: true,
    value: { lastPeriodStart: input.lastPeriodStart, cycleLength, periodLength },
  };
}
