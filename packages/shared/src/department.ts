import { createSelectSchema } from "drizzle-zod";
import { departmentsTable } from "./schema";
import { z } from "zod";

export const departmentSummarySchema = createSelectSchema(
  departmentsTable
).omit({
  updatedAt: true,
  createdAt: true,
});

export type DepartmentSummary = z.infer<typeof departmentSummarySchema>;
