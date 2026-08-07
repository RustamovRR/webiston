/**
 * The questions this page answers, in the order it answers them.
 *
 * One list, read by the FAQ component AND by the route's structured data, so a
 * rich result can never advertise a question the page does not carry.
 *
 * They are the questions people actually arrive with — "the call could not hear
 * me" is why somebody opens a microphone test, and every entry here is a
 * failure mode the tool can now distinguish.
 */
export const FAQ_KEYS = [
  "noSound",
  "speakers",
  "privacy",
  "permissionBlocked",
  "deviceBusy",
  "processing",
  "goodLevel",
  "recordings"
] as const
