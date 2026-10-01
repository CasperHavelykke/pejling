import { MAX_REMINDERS, reminderTimes } from "../reminders";

const MIN = 60_000;
const HOUR = 60 * MIN;
const NOW = new Date(2026, 9, 3, 22, 0).getTime();

describe("hvornår appen minder om at logge", () => {
  test("ingen indtastninger, ingen påmindelser", () => {
    expect(reminderTimes({ lastEntryAt: null, now: NOW, minutesToZero: 0 })).toEqual([]);
    expect(reminderTimes({ lastEntryAt: null, now: NOW, minutesToZero: 120 })).toEqual([]);
  });

  test("når tallet er nul, er aftenen slut", () => {
    expect(reminderTimes({ lastEntryAt: NOW - 10 * MIN, now: NOW, minutesToZero: 0 })).toEqual([]);
  });

  test("en time efter seneste indtastning og derefter hver time", () => {
    const last = NOW;
    expect(reminderTimes({ lastEntryAt: last, now: NOW, minutesToZero: 600 })).toEqual([
      last + HOUR,
      last + 2 * HOUR,
      last + 3 * HOUR,
    ]);
  });

  test("højst tre", () => {
    const times = reminderTimes({ lastEntryAt: NOW, now: NOW, minutesToZero: 24 * 60 });
    expect(times).toHaveLength(MAX_REMINDERS);
  });

  test("stopper, før tallet når nul", () => {
    // Nul om 90 minutter: kun påmindelsen efter en time når at komme.
    expect(reminderTimes({ lastEntryAt: NOW, now: NOW, minutesToZero: 90 })).toEqual([NOW + HOUR]);
    // Nul om 40 minutter: ingen.
    expect(reminderTimes({ lastEntryAt: NOW, now: NOW, minutesToZero: 40 })).toEqual([]);
  });

  test("tider, der er passeret, springes over", () => {
    // Seneste indtastning for 90 minutter siden: den første er passeret.
    const last = NOW - 90 * MIN;
    expect(reminderTimes({ lastEntryAt: last, now: NOW, minutesToZero: 600 })).toEqual([
      last + 2 * HOUR,
      last + 3 * HOUR,
    ]);
  });

  test("afstanden kan sættes ned til afprøvning", () => {
    expect(
      reminderTimes({ lastEntryAt: NOW, now: NOW, minutesToZero: 600, intervalMs: 2 * MIN }),
    ).toEqual([NOW + 2 * MIN, NOW + 4 * MIN, NOW + 6 * MIN]);
  });

  test("en påmindelse lige om lidt springes over", () => {
    const last = NOW - HOUR + 30_000;
    const times = reminderTimes({ lastEntryAt: last, now: NOW, minutesToZero: 600 });
    expect(times[0]).toBe(last + 2 * HOUR);
  });
});
