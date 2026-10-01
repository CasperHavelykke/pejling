// Hvornår appen minder om at logge.
//
// En påmindelse kommer en time efter den seneste indtastning og derefter
// hver time, så længe der stadig er aktive genstande, dog højst tre gange.
// Logger man noget, regnes tiderne forfra. Er tallet nået nul, er aftenen
// slut, og der kommer ikke flere.

export const REMINDER_INTERVAL_MS = 3_600_000;
// En påmindelse, der ville komme om under et minut, springes over.
const SOONEST_MS = 60_000;

export const MAX_REMINDERS = 3;

export function reminderTimes({
  lastEntryAt,
  now,
  minutesToZero,
  intervalMs = REMINDER_INTERVAL_MS,
}: {
  // Tidspunktet for den seneste indtastning, eller null uden indtastninger.
  lastEntryAt: number | null;
  now: number;
  // Hvor længe der er til nul aktive genstande.
  minutesToZero: number;
  // Afstanden mellem påmindelserne. Kun under udvikling er den kortere.
  intervalMs?: number;
}): number[] {
  if (lastEntryAt === null || minutesToZero <= 0) return [];
  const zeroAt = now + minutesToZero * 60_000;
  const times: number[] = [];
  for (let k = 1; k <= MAX_REMINDERS; k++) {
    const at = lastEntryAt + k * intervalMs;
    if (at >= zeroAt) break;
    if (at < now + SOONEST_MS) continue;
    times.push(at);
  }
  return times;
}
