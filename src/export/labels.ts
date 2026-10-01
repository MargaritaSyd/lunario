import type { CsvLabels } from '../domain/export';
import { messages } from '../i18n';

export function exportLabels(): CsvLabels {
  return {
    date: messages.exportDate,
    periodStart: messages.exportPeriodStart,
    periodEnd: messages.exportPeriodEnd,
    ongoing: messages.ongoing,
    flow: messages.flow,
    sensations: messages.sensations,
    pains: messages.pain,
    painIntensity: messages.painIntensity,
    moods: messages.mood,
    discharge: messages.discharge,
    note: messages.note,
    yes: messages.yes,
    no: messages.no,
    flowOption: messages.flowOption,
    sensationOption: messages.sensationOption,
    painOption: messages.painOption,
    painIntensityOption: messages.painIntensityOption,
    moodOption: messages.moodOption,
    dischargeOption: messages.dischargeOption,
  };
}
