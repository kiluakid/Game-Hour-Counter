export function formatPlaytime(ms: number): string {
  const hours = ms / (1000 * 60 * 60);
  if (hours === 0) return "Nenhuma hora registrada";
  if (hours < 0.1) return "Menos de 1 hora";
  return `${hours.toFixed(1)} horas`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  const hStr = h > 0 ? `${h}h ` : '';
  const mStr = m > 0 || h > 0 ? `${m}m ` : '';
  return `${hStr}${mStr}${s}s`.trim();
}
