/**
 * Utilidades para fechas y horas en zona horaria de Ecuador (UTC-5)
 */

export function getEcuadorDate(): Date {
  const now = new Date();
  // Ecuador is UTC-5
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc - 3600000 * 5);
}

export function formatEcuadorDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  
  // Format as DD-MM-YYYY HH:mm:ss in Ecuador timezone
  return d.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');
}

export function calculateRemainingSeconds(lastClaimedOrPurchasedAt: string | Date): { canClaim: boolean; remainingSeconds: number } {
  const baseTime = new Date(lastClaimedOrPurchasedAt).getTime();
  const nextClaimTime = baseTime + 24 * 60 * 60 * 1000; // 24 hours
  const now = new Date().getTime();

  if (now >= nextClaimTime) {
    return { canClaim: true, remainingSeconds: 0 };
  }

  const remaining = Math.max(0, Math.floor((nextClaimTime - now) / 1000));
  return { canClaim: false, remainingSeconds: remaining };
}

export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}
