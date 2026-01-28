import { redis } from "../../config/redis";
import { idempotencyKey } from "./idempotency.keys";

export async function acquireEmailSendLock(params: {
  emailJobId: string;
  ttlSeconds: number;
}) {
  const key = idempotencyKey(params.emailJobId);
  const ttl = params.ttlSeconds ?? 60 * 5; // default 5 minutes

  const result = await redis.set(key, "1", "EX", ttl, "NX");

  return { acquired: result === "OK", key };
}

export async function releaseEmailsendLock(key: string) {
  await redis.del(key);
}
