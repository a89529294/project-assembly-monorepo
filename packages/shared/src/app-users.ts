import {
  departmentsTable,
  EmployeeFromDb,
  APP_PERMISSIONS,
  employeesTable,
} from "./schema";
import { z } from "zod";
import {
  paginatedSchemaGenerator,
  summaryQueryInputSchemaGenratorUnsafe,
} from "./utils";
import { createSelectSchema } from "drizzle-zod";

export type EmployeeOrAppUserWithDepartments =
  | {
      id: `employee:${string}`;
      employee: Omit<EmployeeFromDb, "createdAt" | "updatedAt">;
      departments: (typeof departmentsTable.$inferSelect & {
        jobTitle: string;
      })[];
    }
  | {
      id: `appUser:${string}`;
      employee: Omit<EmployeeFromDb, "createdAt" | "updatedAt">;
      departments: (typeof departmentsTable.$inferSelect & {
        jobTitle: string;
      })[];
    };

export const appUserPermissionEnum = z.enum(APP_PERMISSIONS);
export type AppUserPermission = z.infer<typeof appUserPermissionEnum>;

const employeeOrAppUserWithDepartmentsSchema = z.object({
  id: z
    .union([z.string().regex(/^employee:/), z.string().regex(/^appUser:/)])
    .refine(
      (val) => val.startsWith("employee:") || val.startsWith("appUser:"),
      {
        message: "ID must start with 'employee:' or 'appUser:'",
      }
    ),
  employee: createSelectSchema(employeesTable).omit({
    updatedAt: true,
    createdAt: true,
  }),
  departments: z.array(
    createSelectSchema(departmentsTable).extend({ jobTitle: z.string() })
  ),
});

// Array schema
export const employeeOrAppUserWithDepartmentsArraySchema = z.array(
  employeeOrAppUserWithDepartmentsSchema
);

export const appUsersOrEmployeesSummaryQueryInputSchema =
  summaryQueryInputSchemaGenratorUnsafe(
    employeeOrAppUserWithDepartmentsSchema,
    "employee.idNumber"
  );

export const paginatedAppUsersOrEmployeesSummarySchema =
  paginatedSchemaGenerator(employeeOrAppUserWithDepartmentsSchema);
