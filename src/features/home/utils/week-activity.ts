/** Dia da semana local de uma data ISO, com segunda = 0 e domingo = 6. */
export function mondayIndex(iso: string): number {
  return (new Date(iso).getDay() + 6) % 7;
}

/** Soma os segundos ativos por dia da semana (segunda a domingo). */
export function sumSecondsByWeekday(
  activities: { startedAt: string; activeDurationSeconds: number }[],
): number[] {
  const days = Array.from({ length: 7 }, () => 0);
  for (const activity of activities) days[mondayIndex(activity.startedAt)] += activity.activeDurationSeconds;
  return days;
}

/** Iniciais de segunda a domingo no idioma do app (ex.: S T Q Q S S D). */
export function weekdayInitials(locale: string): string[] {
  // 2024-01-01 foi uma segunda-feira.
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2024, 0, 1 + index)).toUpperCase(),
  );
}

/** Iniciais de um nome para o avatar (ex.: "Julia Andrade" → "JA"). */
export function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}
