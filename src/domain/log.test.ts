import { blankLog, encodeList, isEmptyLog, normalizeNote, parseStoredLog } from './log';

describe('day log', () => {
  it('treats a blank day as empty and keeps several sensations, pains, and moods', () => {
    expect(isEmptyLog(blankLog('2026-09-30'))).toBe(true);
    expect(isEmptyLog({ ...blankLog('2026-09-30'), note: '   ' })).toBe(true);
    expect(isEmptyLog({ ...blankLog('2026-09-30'), sensations: ['bloating'] })).toBe(false);

    expect(
      parseStoredLog({
        date: '2026-09-30',
        flow: 'heavy',
        sensations: 'bloating,nope,fatigue',
        pain: 'mild,cramps',
        painIntensity: null,
        mood: 'calm,anxious',
        discharge: null,
        note: ' cramps ',
      }),
    ).toEqual({
      date: '2026-09-30',
      flow: 'heavy',
      sensations: ['bloating', 'fatigue'],
      pains: ['cramps'],
      painIntensity: 'mild',
      moods: ['calm', 'anxious'],
      discharge: null,
      note: ' cramps ',
    });
    expect(encodeList(['cramps', 'head'])).toBe('cramps,head');
    expect(encodeList([])).toBeNull();
  });

  it('drops unknown values and prefers the intensity column', () => {
    expect(
      parseStoredLog({
        date: '2026-09-30',
        flow: 'torrent',
        sensations: ' bloating , nope , fatigue ',
        pain: 'mild,cramps',
        painIntensity: 'severe',
        mood: 'furious',
        discharge: 'watery',
        note: null,
      }),
    ).toEqual({
      date: '2026-09-30',
      flow: null,
      sensations: ['bloating', 'fatigue'],
      pains: ['cramps'],
      painIntensity: 'severe',
      moods: [],
      discharge: null,
      note: '',
    });
    expect(isEmptyLog({ ...blankLog('2026-09-30'), painIntensity: 'mild' })).toBe(false);
  });

  it('trims a note to the limit', () => {
    expect(normalizeNote('  hello  ')).toBe('hello');
    expect(normalizeNote('a'.repeat(600))).toHaveLength(500);
    expect(
      parseStoredLog({
        date: 'yesterday',
        flow: null,
        sensations: null,
        pain: null,
        painIntensity: null,
        mood: null,
        discharge: null,
        note: null,
      }),
    ).toBeNull();
  });
});
