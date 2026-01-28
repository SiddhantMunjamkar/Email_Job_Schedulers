export function idempotencyKey(emailJobId: string) {
  return `lock:email-sent:${emailJobId}`;
}
