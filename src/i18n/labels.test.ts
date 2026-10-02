import { cycleLengthLabel, lateLabel, messages, reminderLabel } from './index';
import { fill } from './language';

describe('cycle labels', () => {
  it('uses the singular late day and fills the plural', () => {
    expect(lateLabel(1)).toBe(messages.lateOne);
    expect(lateLabel(3)).toBe(fill(messages.lateOther, { count: 3 }));
  });

  it('names today, tomorrow, and a later reminder', () => {
    expect(reminderLabel(0)).toBe(messages.reminderToday);
    expect(reminderLabel(-1)).toBe(messages.reminderToday);
    expect(reminderLabel(1)).toBe(messages.reminderTomorrow);
    expect(reminderLabel(4)).toBe(fill(messages.reminderInDays, { count: 4 }));
  });

  it('fills the cycle length', () => {
    expect(cycleLengthLabel(28)).toBe(fill(messages.cycleLengthValue, { count: 28 }));
  });
});
