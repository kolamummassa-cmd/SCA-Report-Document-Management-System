import { prisma } from "../../lib/prisma";

/**
 * Generates human-readable, unique report numbers: SCA-RPT-2026-000123.
 *
 * Implementation note: rather than a dedicated sequence table, this counts
 * existing reports for the current year and retries on a unique-constraint
 * collision (rare — only possible under concurrent submissions in the same
 * millisecond). Fine for Phase 4 volume; if report throughput ever gets high
 * enough for this to matter, swap in a Postgres `SEQUENCE` per year.
 */
export async function generateReportNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SCA-RPT-${year}-`;

  const count = await prisma.report.count({
    where: { reportNumber: { startsWith: prefix } },
  });

  return `${prefix}${String(count + 1).padStart(6, "0")}`;
}

/** Retries report creation on a reportNumber collision (P2002). */
export async function withUniqueReportNumber<T>(
  createFn: (reportNumber: string) => Promise<T>,
  maxAttempts = 5
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const reportNumber = await generateReportNumber();
    try {
      return await createFn(reportNumber);
    } catch (err: unknown) {
      const isUniqueConflict =
        typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
      if (!isUniqueConflict) throw err;
      lastError = err;
    }
  }
  throw lastError;
}
