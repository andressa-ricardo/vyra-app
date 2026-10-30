export type GreetingKey = 'home.greeting.morning' | 'home.greeting.afternoon' | 'home.greeting.evening';

export function getGreetingKey(date: Date): GreetingKey {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'home.greeting.morning';
  if (hour >= 12 && hour < 18) return 'home.greeting.afternoon';
  return 'home.greeting.evening';
}

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

/** Ex.: "Sexta-feira, 30 de outubro" em pt-BR ou "Friday, October 30" em inglês. */
export function formatLongDate(date: Date, locale: string): string {
  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return formatted.charAt(0).toLocaleUpperCase(locale) + formatted.slice(1);
}
