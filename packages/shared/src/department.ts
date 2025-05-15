import { createSelectSchema } from "drizzle-zod";
import { departmentsTable } from "./schema";
import { z } from "zod";

export const departmentSummarySchema = createSelectSchema(departmentsTable)
  .omit({
    updatedAt: true,
    createdAt: true,
  })
  .extend({
    name: z.string().min(1, "名稱不能為空"),
    enPrefix: z.string().min(1, "英文前綴不能為空"),
    zhPrefix: z.string().min(1, "中文前綴不能為空"),
  });

export type DepartmentSummary = z.infer<typeof departmentSummarySchema>;

export const updateDepartmentSchema = departmentSummarySchema;
export const createDepartmentSchema = updateDepartmentSchema.omit({ id: true });

export type UpdateDepartment = z.infer<typeof updateDepartmentSchema>;
export type CreateDepartment = z.infer<typeof createDepartmentSchema>;
