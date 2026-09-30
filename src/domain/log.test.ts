import { blankLog, isEmptyLog, normalizeNote, parseStoredLog } from './log';

describe('day log', () => {
  it('treats a blank day as empty and ignores unknown stored values', () => {
    expect(isEmptyLog(blankLog('2026-09-30'))).toBe(true);
    expect(isEmptyLog({ ...blankLog('2026-09-30'), note: '   ' })).toBe(true);
    expect(isEmptyLog({ ...blankLog('2026-09-30'), flow: 'light' })).toBe(false);

    expect(
      parseStoredLog({
        date: '2026-09-30',
        flow: 'heavy',
        pain: 'nope',
        mood: 'calm',
        discharge: null,
        note: ' cramps ',
      }),
    ).toEqual({
      date: '2026-09-30',
      flow: 'heavy',
      pain: null,
      mood: 'calm',
      discharge: null,
      note: ' cramps ',
    });
  });

  it('trims a note to the limit', () => {
    expect(normalizeNote('  hello  ')).toBe('hello');
    expect(normalizeNote('a'.repeat(600))).toHaveLength(500);
    expect(parseStoredLog({ date: 'yesterday', flow: null, pain: null, mood: null, discharge: null, note: null })).toBeNull();
  });
});
