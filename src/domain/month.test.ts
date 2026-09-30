import { monthGrid } from './month';

describe('monthGrid', () => {
  it('starts September 2026 on Tuesday and pads to full weeks', () => {
    const cells = monthGrid('2026-09-15');

    expect(cells).toHaveLength(35);
    expect(cells[0]).toBeNull();
    expect(cells[1]).toBe('2026-09-01');
    expect(cells[30]).toBe('2026-09-30');
    expect(cells[31]).toBeNull();
  });
});
