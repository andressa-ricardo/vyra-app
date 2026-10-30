import {
  formatBirthDate,
  formatDecimal,
  maskBirthDate,
  parseBirthDate,
  parseDecimal,
} from './personal-data';

describe('maskBirthDate', () => {
  it.each([
    ['3', '3'],
    ['3012', '30/12'],
    ['30121990', '30/12/1990'],
    ['30/12/19901', '30/12/1990'],
  ])('masks %s as %s', (input, expected) => {
    expect(maskBirthDate(input)).toBe(expected);
  });
});

describe('parseBirthDate', () => {
  it('converts to the backend format', () => {
    expect(parseBirthDate('05/03/1994')).toBe('1994-03-05');
  });

  it('rejects dates that do not exist', () => {
    expect(parseBirthDate('31/02/1994')).toBeNull();
    expect(parseBirthDate('5/3/1994')).toBeNull();
  });
});

describe('formatBirthDate', () => {
  it('formats the ISO date returned by the backend', () => {
    expect(formatBirthDate('1994-03-05T00:00:00.000Z')).toBe('05/03/1994');
    expect(formatBirthDate(null)).toBe('');
  });
});

describe('decimals', () => {
  it('accepts comma as decimal separator', () => {
    expect(parseDecimal('68,5')).toBe(68.5);
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('68,555')).toBeNaN();
  });

  it('formats backend decimal strings for the field', () => {
    expect(formatDecimal('68.50')).toBe('68,5');
    expect(formatDecimal(null)).toBe('');
  });
});
