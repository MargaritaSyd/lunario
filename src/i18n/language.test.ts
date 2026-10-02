import { fill, languageFromCode } from './language';

describe('languageFromCode', () => {
  it('keeps English as the default', () => {
    expect(languageFromCode(undefined)).toBe('en');
    expect(languageFromCode('en-US')).toBe('en');
    expect(languageFromCode('fr')).toBe('en');
  });

  it('uses Spanish for any Spanish device language', () => {
    expect(languageFromCode('es')).toBe('es');
    expect(languageFromCode('es-AR')).toBe('es');
    expect(languageFromCode('ES-MX')).toBe('es');
  });
});

describe('fill', () => {
  it('replaces named placeholders and leaves the rest of the text', () => {
    expect(fill('{{count}} días', { count: 3 })).toBe('3 días');
    expect(fill('{{missing}}', {})).toBe('');
    expect(fill('sin huecos', { count: 1 })).toBe('sin huecos');
  });
});
