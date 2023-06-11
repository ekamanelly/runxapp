export function getMillisecondsDifference(
  start_date: Date | undefined,
): number {
  const now = Date.now();
  const startDateMillis = start_date
    ? new Date(start_date).getTime()
    : now + 1000;
  return Math.max(0, startDateMillis - now);
}
