import { ConnectionOptions } from "bullmq";

export const bullConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};
