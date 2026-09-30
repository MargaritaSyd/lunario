import { parseOnboarding } from './onboarding';

const today = '2026-09-30';

describe('parseOnboarding', () => {
  it('accepts the defaults', () => {
    expect(
      parseOnboarding({ lastPeriodStart: '2026-09-02', cycleLength: '28', periodLength: '5' }, today),
    ).toEqual({
      ok: true,
      value: { lastPeriodStart: '2026-09-02', cycleLength: 28, periodLength: 5 },
    });
  });

  it('rejects a future or malformed date', () => {
    expect(parseOnboarding({ lastPeriodStart: '2026-10-01', cycleLength: '28', periodLength: '5' }, today)).toMatchObject({
      error: 'invalid-date',
    });
    expect(parseOnboarding({ lastPeriodStart: '09/02/2026', cycleLength: '28', periodLength: '5' }, today)).toMatchObject({
      error: 'invalid-date',
    });
  });

  it('rejects cycle and bleeding lengths outside the allowed range', () => {
    expect(parseOnboarding({ lastPeriodStart: '2026-09-01', cycleLength: '14', periodLength: '5' }, today)).toMatchObject({
      error: 'cycle-length',
    });
    expect(parseOnboarding({ lastPeriodStart: '2026-09-01', cycleLength: '91', periodLength: '5' }, today)).toMatchObject({
      error: 'cycle-length',
    });
    expect(parseOnboarding({ lastPeriodStart: '2026-09-01', cycleLength: '28', periodLength: '0' }, today)).toMatchObject({
      error: 'period-length',
    });
    expect(parseOnboarding({ lastPeriodStart: '2026-09-01', cycleLength: '28', periodLength: '15' }, today)).toMatchObject({
      error: 'period-length',
    });
  });

  it('accepts the shortest cycle with the longest bleeding', () => {
    expect(parseOnboarding({ lastPeriodStart: '2026-09-01', cycleLength: '15', periodLength: '14' }, today)).toEqual({
      ok: true,
      value: { lastPeriodStart: '2026-09-01', cycleLength: 15, periodLength: 14 },
    });
  });
});
