export type Language = 'en' | 'es';

/** Maps a device language code or tag to a catalog. Anything else stays in English. */
export function languageFromCode(code: string | null | undefined): Language {
  const base = code?.toLowerCase().split('-')[0];
  if (base === 'es') return 'es';
  return 'en';
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ''));
}
