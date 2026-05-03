/**
 * Shared utilities for CRUD form components (edit prefill, date format).
 */

/**
 * Converts a date from API (ISO string or Date) to YYYY-MM-DDTHH:mm for datetime-local inputs.
 */
export function toDatetimeLocalFormat(
  date: string | Date | number | null | undefined | unknown
): string {
  if (date == null || date === '') return '';
  try {
    const d = typeof date === 'object' && date !== null && 'getTime' in date
      ? (date as Date)
      : new Date(date as string | number);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  } catch {
    const str = String(date);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) return str.slice(0, 16);
    return '';
  }
}

/**
 * Ensures a value is a number suitable for a select bound to ngValue (id).
 * Returns null if invalid; use for optional FK fields.
 */
export function toSelectId(value: string | number | null | undefined | unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
