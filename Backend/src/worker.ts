import "dotenv/config";
import { startEmailWorker } from "./queue/email.worker";
import { reconciliationOnStartup } from "./scheduler/reconciliationOnstartup";

async function startWorker() {
  await reconciliationOnStartup();

  startEmailWorker();
  console.log("Worker started");
}

startWorker().catch((error) => {
  console.error("Error starting worker:", error);
  process.exit(1);
});
