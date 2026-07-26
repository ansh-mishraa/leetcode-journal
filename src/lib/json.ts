import type { Prisma } from "@/generated/prisma/client";

/** Coerce unknown values into Prisma JSON input. */
export function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
