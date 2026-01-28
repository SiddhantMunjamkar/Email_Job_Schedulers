export function senderHourlyKey(senderId: string, hourkey: string) {
  return `rateLimit:sender:${senderId}:${hourkey}`;
}
