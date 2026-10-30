import { formatLongDate, getFirstName, getGreetingKey } from './greeting';

describe('getGreetingKey', () => {
  it.each([
    [5, 'home.greeting.morning'],
    [11, 'home.greeting.morning'],
    [12, 'home.greeting.afternoon'],
    [17, 'home.greeting.afternoon'],
    [18, 'home.greeting.evening'],
    [2, 'home.greeting.evening'],
  ])('at %s:00 returns %s', (hour, key) => {
    expect(getGreetingKey(new Date(2026, 9, 30, hour))).toBe(key);
  });
});

describe('getFirstName', () => {
  it('uses only the first name and ignores extra spaces', () => {
    expect(getFirstName('  Julia   Ricardo ')).toBe('Julia');
  });
});

describe('formatLongDate', () => {
  it('capitalizes the weekday in Brazilian Portuguese', () => {
    expect(formatLongDate(new Date(2026, 9, 30), 'pt-BR')).toBe('Sexta-feira, 30 de outubro');
  });
});
