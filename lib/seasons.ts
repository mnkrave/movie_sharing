export function formatWatchedSeasons(
  watchedSeasons?: number[] | null,
  totalSeasons?: number | null
): string {
  if (!watchedSeasons || watchedSeasons.length === 0) {
    return "Alle Staffeln";
  }
  const total = totalSeasons || 0;
  if (total > 0 && watchedSeasons.length >= total) {
    return "Alle Staffeln";
  }
  const sorted = [...watchedSeasons].sort((a, b) => a - b);
  if (sorted.length === 1) {
    return `Staffel ${sorted[0]}`;
  }
  if (sorted.length === 2) {
    return `Staffel ${sorted[0]}+${sorted[1]}`;
  }
  const isConsecutive = sorted.every((val, idx) => idx === 0 || val === sorted[idx - 1] + 1);
  if (isConsecutive) {
    return `Staffel ${sorted[0]}–${sorted[sorted.length - 1]}`;
  }
  return `Staffel ${sorted.join("+")}`;
}
