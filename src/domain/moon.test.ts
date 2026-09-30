import { moonPhase } from './moon';

describe('moonPhase', () => {
  it('marks the September 2026 new and full moons', () => {
    expect(moonPhase('2026-09-10')).toBe('waning');
    expect(moonPhase('2026-09-11')).toBe('new');
    expect(moonPhase('2026-09-12')).toBe('waxing');
    expect(moonPhase('2026-09-18')).toBe('waxing');
    expect(moonPhase('2026-09-25')).toBe('waxing');
    expect(moonPhase('2026-09-26')).toBe('full');
    expect(moonPhase('2026-09-27')).toBe('waning');
  });

  it('marks the October 2026 new and full moons', () => {
    expect(moonPhase('2026-10-09')).toBe('waning');
    expect(moonPhase('2026-10-10')).toBe('new');
    expect(moonPhase('2026-10-11')).toBe('waxing');
    expect(moonPhase('2026-10-25')).toBe('waxing');
    expect(moonPhase('2026-10-26')).toBe('full');
    expect(moonPhase('2026-10-27')).toBe('waning');
  });
});
