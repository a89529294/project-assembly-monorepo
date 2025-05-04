import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { employeesTable } from "./schema";
import { paginatedSchemaGenerator } from "./utils";

export const employeeSummarySchema = createSelectSchema(employeesTable).omit({
  updated_at: true,
  created_at: true,
});

export type EmployeeSummary = z.infer<typeof employeeSummarySchema>;

export const paginatedEmployeeSummarySchema = paginatedSchemaGenerator(
  employeeSummarySchema
);

export const employeeDetailedSchema = employeeSummarySchema
  .omit({ id: true })
  .extend({
    // validations
    idNumber: employeeSummarySchema.shape.idNumber.min(1, {
      message: "idNumber 不能為空",
    }),
    chName: employeeSummarySchema.shape.chName.min(1, {
      message: "中文名 不能為空",
    }),
    phone: employeeSummarySchema.shape.phone.min(1, {
      message: "電話 不能為空",
    }),
    // extra field
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

export type EmployeeDetail = z.infer<typeof employeeDetailedSchema>;
