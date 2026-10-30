/** Aplica a máscara dd/mm/aaaa enquanto o usuário digita. */
export function maskBirthDate(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('/');
}

/** dd/mm/aaaa → AAAA-MM-DD, ou `null` se a data não existir no calendário. */
export function parseBirthDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }
  return `${year}-${month}-${day}`;
}

/** Data do backend (ISO) → dd/mm/aaaa para o campo. */
export function formatBirthDate(isoDate: string | null): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : '';
}

/** Aceita vírgula ou ponto como separador decimal. `NaN` indica formato inválido. */
export function parseDecimal(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

export function formatDecimal(value: string | number | null): string {
  if (value === null || value === '') return '';
  return String(Number(value)).replace('.', ',');
}
