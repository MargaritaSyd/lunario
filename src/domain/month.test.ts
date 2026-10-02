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

  it('pads a Sunday start and a Monday start to full weeks', () => {
    const february = monthGrid('2026-02-10');
    expect(february).toHaveLength(35);
    expect(february.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(february[6]).toBe('2026-02-01');
    expect(february[33]).toBe('2026-02-28');
    expect(february[34]).toBeNull();

    const june = monthGrid('2026-06-15');
    expect(june[0]).toBe('2026-06-01');
    expect(june[29]).toBe('2026-06-30');
    expect(june[30]).toBeNull();
    expect(june).toHaveLength(35);
  });

  it('does not carry days into the next or previous year', () => {
    const december = monthGrid('2026-12-15');
    expect(december[1]).toBe('2026-12-01');
    expect(december[31]).toBe('2026-12-31');
    expect(december.some((cell) => cell?.startsWith('2027'))).toBe(false);

    const january = monthGrid('2027-01-15');
    expect(january.slice(0, 4)).toEqual([null, null, null, null]);
    expect(january[4]).toBe('2027-01-01');
    expect(january[34]).toBe('2027-01-31');
    expect(january.some((cell) => cell?.startsWith('2026'))).toBe(false);
  });
});
