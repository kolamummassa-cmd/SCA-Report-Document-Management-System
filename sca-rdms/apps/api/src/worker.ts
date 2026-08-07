/**
 * Background worker entry point.
 * Phase 2: process/connection bootstrap only.
 * Phase 9+ adds real BullMQ job processors (reminder emails, backups,
 * export generation, thumbnailing) under `src/jobs/`.
 */

import "./lib/bigint-json";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

async function main() {
  logger.info(`SCA RDMS worker starting (${env.NODE_ENV})...`);

  // Phase 9+: register queue processors here, e.g.
  // import { registerReminderEmailJob } from "./jobs/reminder-emails.job";
  // registerReminderEmailJob();

  logger.info("Worker ready (no job processors registered yet — Phase 2 scaffold).");
}

main().catch(async (err) => {
  logger.error({ err }, "Fatal worker error");
  await prisma.$disconnect();
  process.exit(1);
});
