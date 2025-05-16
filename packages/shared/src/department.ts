import { createSelectSchema } from "drizzle-zod";
import { departmentsTable } from "./schema";
import { z } from "zod";
import { trimThenValidate } from "./utils";

export const departmentSummarySchema = createSelectSchema(departmentsTable)
  .omit({
    updatedAt: true,
    createdAt: true,
  })
  .extend({
    name: trimThenValidate("名稱不能為空"),
    enPrefix: trimThenValidate("英文前綴不能為空"),
    zhPrefix: trimThenValidate("中文前綴不能為空"),
  });

export type DepartmentSummary = z.infer<typeof departmentSummarySchema>;

export const updateDepartmentSchema = departmentSummarySchema;
export const createDepartmentSchema = updateDepartmentSchema.omit({ id: true });

export type UpdateDepartment = z.infer<typeof updateDepartmentSchema>;
export type CreateDepartment = z.infer<typeof createDepartmentSchema>;
