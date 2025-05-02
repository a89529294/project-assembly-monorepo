import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { employeesTable } from "./schema";

const baseSchema = createSelectSchema(employeesTable).omit({
  updated_at: true,
  created_at: true,
});

const baseEmployeeSelectSchema = baseSchema.extend({
  idNumber: baseSchema.shape.idNumber.min(1, { message: "idNumber 不能為空" }),
  chName: baseSchema.shape.chName.min(1, { message: "中文名 不能為空" }),
  phone: baseSchema.shape.phone.min(1, { message: "電話 不能為空" }),
});

export const employeeSelectSchema = baseEmployeeSelectSchema.extend({
  departments: z.array(
    z.object({
      departmentName: z.string().min(1, { message: "部門 不能為空" }),
      departmentId: z.string().min(1, {
        message: "部門 不能為空",
      }),
      jobTitle: z.string().min(1, {
        message: "職位 不能為空",
      }),
    })
  ),
});

export type EmployeeSelect = z.infer<typeof employeeSelectSchema>;

export * from "./schema";
