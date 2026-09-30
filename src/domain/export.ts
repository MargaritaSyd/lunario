import type { DateKey } from './dates';
import { isEmptyLog, normalizeNote, type DayLog } from './log';
import { sortCycles, type Cycle } from './predict';

export type ExportSettings = {
  cycleLength: number;
  periodLength: number;
  showFertileWindow: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
};

export type ExportDocument = {
  app: 'lunario';
  exportedOn: DateKey;
  settings: ExportSettings;
  cycles: Cycle[];
  logs: DayLog[];
};

export function buildExport(input: {
  exportedOn: DateKey;
  settings: ExportSettings;
  cycles: Cycle[];
  logs: DayLog[];
}): ExportDocument {
  const logs = input.logs
    .filter((log) => !isEmptyLog(log))
    .map((log) => ({ ...log, note: normalizeNote(log.note) }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return {
    app: 'lunario',
    exportedOn: input.exportedOn,
    settings: input.settings,
    cycles: sortCycles(input.cycles),
    logs,
  };
}
