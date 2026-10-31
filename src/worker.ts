import { Worker } from "bullmq";

import { connection } from "./connection.ts";
import { QUEUE_NAME, type EmailJobData } from "./queue.ts";

export function startWorker() {
  const worker = new Worker<EmailJobData>(
    QUEUE_NAME,
    async (job) => {
      const { to, subject } = job.data;

      console.log(`Enviando e-mail para ${to}: ${subject}`);
      // Simula o envio; troque pela integração real de e-mail
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { sentAt: new Date().toISOString() };
    },
    { connection },
  );

  worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} concluído: ${JSON.stringify(result)}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} falhou: ${err.message}`);
  });

  console.log(`Worker escutando a fila "${QUEUE_NAME}"`);

  return worker;
}
