// Web-udgave til forhåndsvisning i browseren. Her findes ingen påmindelser,
// så tilladelsen er altid nej, og resten gør ingenting.

export async function requestReminderPermission(
  _channelName: string,
): Promise<boolean> {
  return false;
}

export async function setReminders(
  _times: readonly number[],
  _text: { title: string; body: string; channel: string },
): Promise<void> {}

export async function clearShownReminders(): Promise<void> {}
