import { z } from "zod";

export const baseEmployeeSelectSchema = z.object({
  id: z.string().uuid(),
  idNumber: z.string(),
  chName: z.string(),
  enName: z.string().nullable(),
  birthday: z.date().nullable(),
  gender: z.enum(["male", "female"]),
  marital_status: z.string().nullable(),
  education: z.string().nullable(),
  phone1: z.string(),
  email: z.string().email().nullable(),
  residenceCounty: z.string().nullable(),
  residenceDistrict: z.string().nullable(),
  residenceAddress: z.string().nullable(),
  mailingCounty: z.string().nullable(),
  mailingDistrict: z.string().nullable(),
  mailingAddress: z.string().nullable(),
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
