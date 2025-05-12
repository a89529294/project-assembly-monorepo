import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { APP_PERMISSIONS, departmentsTable, employeesTable } from "./schema";
import {
  paginatedSchemaGenerator,
  summaryQueryNestedInputSchemaGenerator,
} from "./utils";

export const appUserPermissionEnum = z.enum(APP_PERMISSIONS);
export type AppUserPermission = z.infer<typeof appUserPermissionEnum>;

const appUserWithDepartmentsSchema = z.object({
  id: z.string(),
  employee: createSelectSchema(employeesTable),
  departments: z.array(
    createSelectSchema(departmentsTable).extend({ jobTitle: z.string() })
  ),
});

const appUserOrEmployeeWithSpecificDepartmentSchema = z.object({
  id: z.string(),
  idNumber: z.string(),
  name: z.string(),
  department: z.object({
    id: z.string(),
    name: z.string(),
    jobTitle: z.string().nullable(),
  }),
  isAppUser: z.boolean(),
  permissions: z.array(z.enum(APP_PERMISSIONS)),
});

export type AppUserWithDepartments = z.infer<
  typeof appUserWithDepartmentsSchema
>;
export type AppUserOrEmployeeWithSpecificDepartment = z.infer<
  typeof appUserOrEmployeeWithSpecificDepartmentSchema
>;

// Array schema
export const employeeOrAppUserWithDepartmentsArraySchema = z.array(
  appUserWithDepartmentsSchema
);

export const appUsersOrEmployeesSummaryQueryInputSchema =
  summaryQueryNestedInputSchemaGenerator(
    appUserWithDepartmentsSchema,
    "employee",
    "idNumber"
  )
    .extend({
      departmentId: z.string(),
    })
    .omit({
      orderBy: true,
      orderDirection: true,
      searchTerm: true,
    });

export const paginatedAppUsersSummarySchema = paginatedSchemaGenerator(
  appUserWithDepartmentsSchema
);

export const paginatedAppUsersOrEmployeesWithSpecificDepartmentSummarySchema =
  paginatedSchemaGenerator(appUserOrEmployeeWithSpecificDepartmentSchema);
