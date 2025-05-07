import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { hashPassword } from "../../db/password.js";
import {
  AppUserFromDb,
  appUserPermissions,
  appUsersTable,
  DepartmentFromDb,
  departmentsTable,
  EmployeeFromDb,
  employeesTable,
  rolesTable,
  userRolesTable,
  usersTable,
} from "../../db/schema.js";
import { generatePassword } from "../../helpers/auth.js";
import { protectedProcedure } from "../../trpc/core.js";
import { appUsersWithEmployeeAndDepartmentsQuery } from "./helpers.js";

export const createUserFromEmployeeProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      employeeId: z.string().uuid(),
    })
  )
  .mutation(async ({ input }) => {
    // check if employee exist
    const employees = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.id, input.employeeId));

    if (employees.length === 0)
      throw new TRPCError({
        code: "CONFLICT",
        message: "Employee does not exist",
      });

    // Check if employeeId has already been used
    const userWithTheSameEmpId = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.employeeId, input.employeeId));

    if (userWithTheSameEmpId.length)
      throw new TRPCError({
        code: "CONFLICT",
        message: "Employee already has user",
      });

    const employee = employees[0];

    const generatedPassword = generatePassword();
    const passwordHash = await hashPassword(generatedPassword);

    const user = await db
      .insert(usersTable)
      .values({
        account: employee.idNumber,
        name: employee.chName,
        employeeId: input.employeeId,
        passwordHash,
      })
      .returning();
    return user[0];
  });

export const createUserWithRolesProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      account: z.string().min(1),
      name: z.string().min(1),
      roleIds: z.array(z.string().uuid()).min(1),
    })
  )
  .mutation(async ({ input }) => {
    const password = generatePassword();
    const passwordHash = await hashPassword(password);

    // Validate all roleIds exist
    const roles = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(inArray(rolesTable.id, input.roleIds));
    if (roles.length !== input.roleIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "One or more roleIds do not exist",
      });
    }

    const user = await db
      .insert(usersTable)
      .values({
        account: input.account,
        name: input.name,
        employeeId: null,
        passwordHash,
      })
      .returning();

    const userId = user[0].id;
    await Promise.all(
      input.roleIds.map((roleId) =>
        db.insert(userRolesTable).values({ userId, roleId })
      )
    );

    return user[0];
  });

export const readAppUsersByPermissionProcedure = protectedProcedure([
  "PersonnelPermissionManagement",
])
  .input(
    z
      .object({
        permission: z.enum(["man-production", "ctr-gdstd", "monitor-weight"]),
      })
      .optional()
  )
  .query(async ({ input }) => {
    console.log(input);

    const genPartialUser = (v: AppUserFromDb) => ({
      id: v.id,
      account: v.account,
      employeeId: v.employeeId,
    });
    const genPartialEmployee = (v: EmployeeFromDb) => {
      const { created_at, updated_at, ...rest } = v;
      return rest;
    };

    const baseQuery = appUsersWithEmployeeAndDepartmentsQuery();

    type AppUserWithEmpAndDepartments = ReturnType<typeof genPartialUser> & {
      employee: ReturnType<typeof genPartialEmployee>;
      departments: (typeof departmentsTable.$inferSelect & {
        jobTitle: string;
      })[];
    };

    const genUsers = async (q: typeof baseQuery) => {
      let rows: {
        appUser: AppUserFromDb;
        employee: EmployeeFromDb;
        department: DepartmentFromDb;
        jobTitle: string | null;
      }[] = [];

      if (input?.permission) {
        // filter by permission
        rows = await q
          .innerJoin(
            appUserPermissions,
            eq(appUsersTable.id, appUserPermissions.appUserId)
          )
          .where(eq(appUserPermissions.permission, input.permission));
      } else {
        rows = await q;
      }

      const userMap = new Map<string, AppUserWithEmpAndDepartments>();
      for (const row of rows) {
        const key = row.appUser.id;
        if (!userMap.has(key)) {
          userMap.set(key, {
            ...genPartialUser(row.appUser),
            employee: genPartialEmployee(row.employee),
            departments: [
              {
                ...row.department,
                jobTitle: row.jobTitle ?? "",
              },
            ],
          });
        } else {
          userMap.get(key)!.departments.push({
            ...row.department,
            jobTitle: row.jobTitle ?? "",
          });
        }
      }
      return Array.from(userMap.values());
    };

    return genUsers(baseQuery);
  });
