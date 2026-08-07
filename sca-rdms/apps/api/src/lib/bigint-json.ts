/**
 * Node's JSON.stringify (which Express's res.json() uses under the hood)
 * throws "Do not know how to serialize a BigInt" for any BigInt value —
 * and Prisma maps the `File.sizeBytes BigInt` column to a native JS BigInt.
 * Any response containing a File, directly or nested (report attachments,
 * document versions, a report once files are attached), would otherwise
 * crash.
 *
 * JSON.stringify checks for a `toJSON` method before giving up, so patching
 * it once here — imported first thing at process start — fixes this
 * everywhere without touching every controller that might return a File.
 * Sizes are serialized as strings (not numbers) to avoid precision loss
 * for anything near/above Number.MAX_SAFE_INTEGER.
 */
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function (this: bigint) {
  return this.toString();
};

export {};
