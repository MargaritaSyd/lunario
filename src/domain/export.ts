import { addDaysKey, type DateKey } from './dates';
import {
  isEmptyLog,
  normalizeNote,
  type DayLog,
  type Discharge,
  type Flow,
  type Mood,
  type Pain,
  type PainIntensity,
  type Sensation,
} from './log';
import { sortCycles, type Cycle } from './predict';

/** Excel with a Spanish locale splits columns on semicolons. */
const DELIMITER = ';';

export type CsvLabels = {
  date: string;
  periodStart: string;
  periodEnd: string;
  ongoing: string;
  flow: string;
  sensations: string;
  pains: string;
  painIntensity: string;
  moods: string;
  discharge: string;
  note: string;
  yes: string;
  no: string;
  flowOption: Record<Flow, string>;
  sensationOption: Record<Sensation, string>;
  painOption: Record<Pain, string>;
  painIntensityOption: Record<PainIntensity, string>;
  moodOption: Record<Mood, string>;
  dischargeOption: Record<Discharge, string>;
};

type Row = {
  date: DateKey;
  periodStart: boolean;
  periodEnd: boolean;
  ongoing: boolean;
  log: DayLog | null;
};

function daysFrom(start: DateKey, end: DateKey): DateKey[] {
  if (end < start) return [];
  const days: DateKey[] = [];
  for (let date = start; date <= end; date = addDaysKey(date, 1)) days.push(date);
  return days;
}

function rowsFor(cycles: Cycle[], logs: DayLog[], today: DateKey): Row[] {
  const byDate = new Map<DateKey, Row>();

  function row(date: DateKey): Row {
    const existing = byDate.get(date);
    if (existing) return existing;
    const created: Row = { date, periodStart: false, periodEnd: false, ongoing: false, log: null };
    byDate.set(date, created);
    return created;
  }

  for (const cycle of sortCycles(cycles)) {
    const ongoing = cycle.endDate === null;
    const end = cycle.endDate ?? today;
    for (const date of daysFrom(cycle.startDate, end)) {
      const current = row(date);
      if (date === cycle.startDate) current.periodStart = true;
      if (cycle.endDate !== null && date === cycle.endDate) current.periodEnd = true;
      if (ongoing) current.ongoing = true;
    }
  }

  for (const log of logs) {
    if (isEmptyLog(log)) continue;
    row(log.date).log = { ...log, note: normalizeNote(log.note) };
  }

  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function joinLabels(values: readonly string[], labels: Record<string, string>): string {
  return values.map((value) => labels[value] ?? value).join('; ');
}

function escapeField(value: string): string {
  if (value.includes('"') || value.includes(DELIMITER) || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function line(fields: string[]): string {
  return fields.map(escapeField).join(DELIMITER);
}

export function buildCsv(input: { today: DateKey; cycles: Cycle[]; logs: DayLog[]; labels: CsvLabels }): string {
  const { labels } = input;
  const header = line([
    labels.date,
    labels.periodStart,
    labels.periodEnd,
    labels.ongoing,
    labels.flow,
    labels.sensations,
    labels.pains,
    labels.painIntensity,
    labels.moods,
    labels.discharge,
    labels.note,
  ]);

  const body = rowsFor(input.cycles, input.logs, input.today).map((row) => {
    const log = row.log;
    return line([
      row.date,
      row.periodStart ? labels.yes : labels.no,
      row.periodEnd ? labels.yes : labels.no,
      row.ongoing ? labels.yes : labels.no,
      log?.flow ? labels.flowOption[log.flow] : '',
      log ? joinLabels(log.sensations, labels.sensationOption) : '',
      log ? joinLabels(log.pains, labels.painOption) : '',
      log?.painIntensity ? labels.painIntensityOption[log.painIntensity] : '',
      log ? joinLabels(log.moods, labels.moodOption) : '',
      log?.discharge ? labels.dischargeOption[log.discharge] : '',
      log?.note ?? '',
    ]);
  });

  return `\uFEFF${[header, ...body].join('\r\n')}\r\n`;
}
