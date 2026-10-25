/**
 * Utility functions for currency and number formatting with Venezuelan and International notation
 */

export function formatUSD(value: number): string {
  if (isNaN(value)) return '$ 0,00';
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value).replace('USD', '$');
}

export function formatBs(value: number): string {
  if (isNaN(value)) return '0,00 Bs.';
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} Bs.`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatLitros(value: number): string {
  if (isNaN(value)) return '0 L';
  return `${formatNumber(value, value % 1 === 0 ? 0 : 1)} L`;
}

export function formatHoras(value: number): string {
  if (isNaN(value)) return '0,0 h';
  return `${formatNumber(value, 1)} h`;
}

export function formatConsumoRatio(value: number): string {
  if (isNaN(value)) return '0,00 L/h';
  return `${formatNumber(value, 2)} L/h`;
}

export function formatMonthYear(monthKey: string): string {
  // expects 'YYYY-MM'
  if (!monthKey || monthKey.length < 7) return monthKey;
  const [year, month] = monthKey.split('-');
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const idx = parseInt(month, 10) - 1;
  return `${monthNames[idx] || month} ${year}`;
}

export function formatMonthShort(monthKey: string): string {
  // e.g. "2026-08" -> "ago-26"
  if (!monthKey || monthKey.length < 7) return monthKey;
  const [year, month] = monthKey.split('-');
  const shortNames = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sept', 'oct', 'nov', 'dic'
  ];
  const idx = parseInt(month, 10) - 1;
  const shortYear = year.slice(-2);
  return `${shortNames[idx] || month}-${shortYear}`;
}
