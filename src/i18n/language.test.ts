import { languageFromCode } from './language';

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
