import { blankLog } from './log';
import { buildCsv, type CsvLabels } from './export';

const labels: CsvLabels = {
  date: 'Fecha',
  periodStart: 'Inicio del periodo',
  periodEnd: 'Fin del periodo',
  ongoing: 'En curso',
  flow: 'Sangrado',
  sensations: 'Sensaciones',
  pains: 'Dolores',
  painIntensity: 'Intensidad',
  moods: 'Humor',
  discharge: 'Flujo',
  note: 'Nota',
  yes: 'Sí',
  no: 'No',
  flowOption: { spotting: 'Manchado', light: 'Ligero', medium: 'Medio', heavy: 'Abundante' },
  sensationOption: {
    bloating: 'Hinchazón',
    'breast-tenderness': 'Sensibilidad en los pechos',
    fatigue: 'Cansancio',
    energy: 'Energía',
    nausea: 'Náuseas',
    craving: 'Antojo',
  },
  painOption: {
    cramps: 'Cólicos',
    head: 'Cabeza',
    back: 'Espalda',
    breasts: 'Pechos',
    'low-back': 'Lumbar',
    pelvis: 'Pelvis',
  },
  painIntensityOption: { mild: 'Leve', moderate: 'Moderado', severe: 'Fuerte' },
  moodOption: {
    calm: 'Calma',
    sensitive: 'Sensible',
    low: 'Bajo',
    irritable: 'Irritable',
    happy: 'Alegre',
    anxious: 'Ansioso',
    tearful: 'Ganas de llorar',
  },
  dischargeOption: { dry: 'Seco', sticky: 'Pegajoso', creamy: 'Cremoso', 'egg-white': 'Clara de huevo' },
};

describe('buildCsv', () => {
  it('writes one row per bleeding day and per logged day, in Spanish', () => {
    const csv = buildCsv({
      today: '2026-02-03',
      cycles: [
        { startDate: '2026-02-01', endDate: null },
        { startDate: '2026-01-01', endDate: '2026-01-03' },
      ],
      logs: [
        { ...blankLog('2026-02-02'), note: '  dijo "hola",\ny siguió  ' },
        blankLog('2026-02-03'),
        {
          ...blankLog('2026-01-02'),
          flow: 'medium',
          sensations: ['nausea'],
          pains: ['cramps', 'low-back'],
          painIntensity: 'moderate',
          moods: ['calm'],
          discharge: 'sticky',
        },
        { ...blankLog('2026-01-10'), flow: 'spotting' },
      ],
      labels,
    });

    expect(csv).toBe(
      '\uFEFFFecha;Inicio del periodo;Fin del periodo;En curso;Sangrado;Sensaciones;Dolores;Intensidad;Humor;Flujo;Nota\r\n' +
        '2026-01-01;Sí;No;No;;;;;;;\r\n' +
        '2026-01-02;No;No;No;Medio;Náuseas;"Cólicos; Lumbar";Moderado;Calma;Pegajoso;\r\n' +
        '2026-01-03;No;Sí;No;;;;;;;\r\n' +
        '2026-01-10;No;No;No;Manchado;;;;;;\r\n' +
        '2026-02-01;Sí;No;Sí;;;;;;;\r\n' +
        '2026-02-02;No;No;Sí;;;;;;;"dijo ""hola"",\ny siguió"\r\n' +
        '2026-02-03;No;No;Sí;;;;;;;\r\n',
    );
  });
});
