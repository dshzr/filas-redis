import { Queue } from "bullmq";

import { connection } from "./connection.ts";

export const QUEUE_NAME = "email";

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export const emailQueue = new Queue<EmailJobData>(QUEUE_NAME, {
  connection,
});


