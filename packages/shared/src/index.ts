import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { employeesTable } from "./schema";

const baseSchema = createSelectSchema(employeesTable).omit({
  updated_at: true,
  created_at: true,
});

const baseEmployeeSelectSchema = baseSchema.extend({
  idNumber: baseSchema.shape.idNumber.min(1, { message: "idNumber 不能為空" }), // Add validation to existing field
});

export const employeeSelectSchema = baseEmployeeSelectSchema.extend({
  departments: z.array(
    z.object({
      departmentName: z.string().min(1),
      departmentId: z.string().min(1),
      jobTitle: z.string().min(1),
    })
  ),
});

export type EmployeeSelect = z.infer<typeof employeeSelectSchema>;

export * from "./schema";
