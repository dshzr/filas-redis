import "dotenv/config";
import type { ConnectionOptions } from "bullmq";

const redisUrl = process.env.REDIS_URL;

export const connection: ConnectionOptions = {
  url: redisUrl,
  maxRetriesPerRequest: null,
};
 