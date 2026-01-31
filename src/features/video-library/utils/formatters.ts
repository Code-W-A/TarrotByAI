export const formatDuration = (
  durationSeconds?: number | null
): string | null => {
  if (durationSeconds === null || durationSeconds === undefined) {
    return null;
  }

  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    return null;
  }

  const totalSeconds = Math.floor(durationSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
