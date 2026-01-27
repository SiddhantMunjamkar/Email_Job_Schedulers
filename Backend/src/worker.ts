import { startEmailWorker } from "./queue/email.worker";

async function startWorker() {
  startEmailWorker();
  console.log("Worker started");
}

startWorker().catch((error) => {
  console.error("Error starting worker:", error);
  process.exit(1);
});
