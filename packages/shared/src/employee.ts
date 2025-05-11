import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { employeesTable } from "./schema";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenrator,
} from "./utils";

export const employeeSummarySchema = createSelectSchema(employeesTable).omit({
  updatedAt: true,
  createdAt: true,
});

export type EmployeeSummary = z.infer<typeof employeeSummarySchema>;

export const paginatedEmployeeSummarySchema = paginatedSchemaGenerator(
  employeeSummarySchema
);

export type EmployeeSummaryKey = keyof EmployeeSummary;

export const employeesSummaryQueryInputSchema = summaryQueryInputSchemaGenrator(
  employeeSummarySchema,
  "idNumber"
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

// export const employeesSummaryQueryInputSchema = z.object({
//   page: z.number().int().min(1).default(1),
//   pageSize: z.number().int().min(1).max(100).default(20),
//   orderBy: z
//     .enum(
//       Object.keys(employeeSummarySchema.shape) as [
//         EmployeeSummaryKey,
//         ...EmployeeSummaryKey[],
//       ]
//     )
//     .default("idNumber"),
//   orderDirection: z
//     .enum(["DESC", "ASC"] as [OrderDirection, ...OrderDirection[]])
//     .default("DESC"),
//   searchTerm: z.string().optional(),
// });
