import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { employeesTable } from "./schema";

// export const baseEmployeeSelectSchema = z.object({
//   id: z.string().uuid(),
//   idNumber: z.string(),
//   chName: z.string(),
//   enName: z.string().nullable(),
//   birthday: z.date().nullable(),
//   gender: z.enum(["male", "female"]),
//   marital_status: z.string().nullable(),
//   education: z.string().nullable(),
//   phone1: z.string(),
//   email: z.string().email().nullable(),
//   residenceCounty: z.string().nullable(),
//   residenceDistrict: z.string().nullable(),
//   residenceAddress: z.string().nullable(),
//   mailingCounty: z.string().nullable(),
//   mailingDistrict: z.string().nullable(),
//   mailingAddress: z.string().nullable(),
// });

// const baseEmployeeSelectSchema = createSelectSchema(employeesTable).pick({
//   id: true,
//   idNumber: true,
//   chName: true,
//   enName: true,
//   birthday: true,
//   gender: true,
//   marital_status: true,
//   education: true,
//   phone1: true,
//   email: true,
//   residenceCounty: true,
//   residenceDistrict: true,
//   residenceAddress: true,
//   mailingCounty: true,
//   mailingDistrict: true,
//   mailingAddress: true,
// });
const baseEmployeeSelectSchema = createSelectSchema(employeesTable).omit({
  updated_at: true,
  created_at: true,
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
