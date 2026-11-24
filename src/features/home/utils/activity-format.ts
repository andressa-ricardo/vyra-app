function pad(value: number) {
  return String(value).padStart(2, '0');
}

/** Duração em partes para exibir número e unidade com pesos diferentes (ex.: 4h 12min). */
export function durationParts(totalSeconds: number): { value: string; unit: string }[] {
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  if (hours) return [{ value: String(hours), unit: 'h' }, { value: String(minutes), unit: 'min' }];
  return [{ value: String(minutes), unit: 'min' }];
}

/** Cronômetro curto: 44:12 ou 1:02:03. */
export function formatClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** Ritmo em minutos por km: 330 → "5:30". */
export function formatPace(secondsPerKm: number): string {
  const rounded = Math.round(secondsPerKm);
  return `${Math.floor(rounded / 60)}:${pad(rounded % 60)}`;
}

export function formatKilometers(meters: number, locale: string, fractionDigits = 2): string {
  return (meters / 1_000).toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: fractionDigits,
  });
}

/** Volume em kg a partir de gramas, sem casas decimais: 6240000 → "6.240". */
export function formatVolumeKg(grams: number, locale: string): string {
  return Math.round(grams / 1_000).toLocaleString(locale);
}

/** Diferença em dias de calendário locais entre a data e hoje. */
export function daysAgo(iso: string, now = new Date()): number {
  const date = new Date(iso);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((today - start) / 86_400_000);
}
