import { createSelectSchema } from "drizzle-zod";
import { departmentsTable } from "./schema";
import { z } from "zod";

export const departmentSummarySchema = createSelectSchema(
  departmentsTable
).omit({
  updated_at: true,
  created_at: true,
});

export type DepartmentSummary = z.infer<typeof departmentSummarySchema>;
