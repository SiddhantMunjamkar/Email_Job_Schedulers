import { ConnectionOptions } from "bullmq";
import { redis } from "./redis";

export const bullConnection: ConnectionOptions = redis;
