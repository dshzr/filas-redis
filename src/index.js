import express from "express";
import { emailQueue } from "./queue.ts";
import { startWorker } from "./worker.ts";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/jobs/email", async (req, res) => {
  const { to, subject, body } = req.body;

  const job = await emailQueue.add("sendEmail", {
    to,
    subject,
    body,
  });

  return res.status(200).json({
    message: `Email enviado para ${to} com sucesso!`,
    subject,
    body,
    jobId: job.id,
  });
});

app.get("/jobs/:id", async (req, res) => {
  const job = await emailQueue.getJob(req.params.id);

  if (!job) {
    return res.status(404).json({ message: "Job não encontrado" });
  }

  return res.status(200).json({
    id: job.id,
    name: job.name,
    status: await job.getState(),
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    attempts: job.attemptsMade,
    createdAt: new Date(job.timestamp).toISOString(),
    finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  startWorker();
});
