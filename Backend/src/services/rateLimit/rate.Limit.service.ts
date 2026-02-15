import { redis } from "../../config/redis";
import { senderHourlyKey } from "./rate.Limit.keys";

export async function tryConsumeSendHourlyQuota(params: {
  senderId: string;
  hourkey: string;
  limitPerHour: number;
}) {
  const key = senderHourlyKey(params.senderId, params.hourkey);

  const now = new Date();

  const endofHour = new Date(now);

  endofHour.setUTCMinutes(59, 59, 999); // set to end of the hour
  const ttlseconds = Math.floor(
    (endofHour.getTime() - endofHour.getTime()) / 1000,
  );

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, ttlseconds); // 5 min sender id -->5min
  }

  const allowed = count <= params.limitPerHour;

  return { allowed, count };
}
