export function getDatePresetRange(preset: string): { fromDate?: string; toDate?: string } {
  const now = new Date();
  if (preset === 'TODAY') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { fromDate: start.toISOString() };
  }
  if (preset === 'YESTERDAY') {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const endYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { fromDate: yesterday.toISOString(), toDate: endYesterday.toISOString() };
  }
  if (preset === '7DAYS') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return { fromDate: start.toISOString() };
  }
  if (preset === 'THIS_MONTH') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { fromDate: start.toISOString() };
  }
  return { fromDate: undefined, toDate: undefined };
}
