import {
  employeeDetailedSchema,
  employeesSummaryQueryInputSchema,
  paginatedEmployeeSummarySchema,
  usersTable,
  selectionInputSchema,
} from "@myapp/shared";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  eq,
  ilike,
  inArray,
  isNull,
  notInArray,
  or,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import {
  departmentsTable,
  employeeDepartmentsTable,
  employeesTable,
  appUsersTable,
  appUserPermissions,
} from "../../db/schema.js";
import { protectedProcedure } from "../core.js";
import { orderDirectionFn } from "../helpers.js";

export const readEmployeesProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .input(
    employeesSummaryQueryInputSchema.extend({
      notAssociatedWithAUser: z.boolean().optional(),
      employeeIds: z.array(z.string().min(1)).optional(),
    })
  )
  .output(paginatedEmployeeSummarySchema)
  .query(async ({ input }) => {
    const { page, pageSize, orderBy, orderDirection, searchTerm } = input;
    const offset = (page - 1) * pageSize;

    const countQuery = db
      .select({ count: count() })
      .from(employeesTable)
      .$dynamic();

    const employeesBaseQuery = db
      .select({
        employees: employeesTable,
      })
      .from(employeesTable)
      .$dynamic();

    // Collect all conditions to combine with AND
    const conditions = [];

    if (searchTerm) {
      const term = `%${searchTerm}%`;
      const whereCondition = or(
        ilike(employeesTable.chName, term),
        ilike(employeesTable.enName, term),
        ilike(employeesTable.email, term),
        ilike(employeesTable.idNumber, term),
        ilike(employeesTable.phone, term),
        ilike(employeesTable.email, term)
      );
      conditions.push(whereCondition);
    }

    if (input.notAssociatedWithAUser) {
      employeesBaseQuery.leftJoin(
        usersTable,
        eq(employeesTable.id, usersTable.employeeId)
      );
      countQuery.leftJoin(
        usersTable,
        eq(employeesTable.id, usersTable.employeeId)
      );
      conditions.push(isNull(usersTable.id));
    }

    if (input.employeeIds && input.employeeIds.length > 0) {
      conditions.push(inArray(employeesTable.id, input.employeeIds));
    }

    if (conditions.length > 0) {
      employeesBaseQuery.where(and(...conditions));
      countQuery.where(and(...conditions));
    }

    const [{ count: total }] = await countQuery;

    const employees = await employeesBaseQuery
      .orderBy(orderDirectionFn(orderDirection)(employeesTable[orderBy]))
      .limit(pageSize)
      .offset(offset);

    const data = employees.map((row) => {
      const { updated_at, created_at, ...rest } = row.employees;
      return rest;
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      page,
      pageSize,
      total,
      totalPages,
      data,
    };
  });

export const readEmployeeByIdProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .input(z.string())
  .output(employeeDetailedSchema)
  .query(async ({ input }) => {
    const employees = await db
      .select()
      .from(employeesTable)
      .leftJoin(
        employeeDepartmentsTable,
        eq(employeeDepartmentsTable.employeeId, employeesTable.id)
      )
      .leftJoin(
        departmentsTable,
        eq(departmentsTable.id, employeeDepartmentsTable.departmentId)
      )
      .where(eq(employeesTable.id, input));

    if (employees.length === 0)
      throw new TRPCError({
        code: "NOT_FOUND",
      });

    const {
      employees: { created_at, updated_at, ...rest },
    } = employees[0];

    const employee = {
      ...rest,
      departments: [] as {
        departmentId: string;
        departmentName: string;
        jobTitle: string;
      }[],
    };

    employees.forEach((e) => {
      if (e.departments && e.employee_departments)
        employee.departments.push({
          departmentId: e.departments.id,
          departmentName: e.departments.name,
          jobTitle: e.employee_departments.jobTitle ?? "",
        });
    });

    return employee;
  });

export const updateEmployeeByIdProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      id: z.string().min(1),
      payload: employeeDetailedSchema,
    })
  )
  .mutation(async ({ input }) => {
    return db.transaction(async (tx) => {
      const { departments, ...employeeData } = input.payload;
      // Update employee
      await tx
        .update(employeesTable)
        .set(employeeData)
        .where(eq(employeesTable.id, input.id));
      // Update department associations
      await tx
        .delete(employeeDepartmentsTable)
        .where(eq(employeeDepartmentsTable.employeeId, input.id));
      if (departments.length) {
        await tx.insert(employeeDepartmentsTable).values(
          departments.map((d) => ({
            employeeId: input.id,
            departmentId: d.departmentId,
            jobTitle: d.jobTitle,
          }))
        );
      }
      return { success: true };
    });
  });

export const createEmployeeProcedure = protectedProcedure([
  "BasicInfoManagement",
  "PersonnelPermissionManagement",
])
  .input(
    z.object({
      payload: employeeDetailedSchema,
    })
  )
  .mutation(async ({ input }) => {
    return db.transaction(async (tx) => {
      const { departments, ...rest } = input.payload;

      const [employee] = await tx
        .insert(employeesTable)
        .values(rest)
        .returning();

      if (departments.length) {
        await tx.insert(employeeDepartmentsTable).values(
          departments.map((d: { departmentId: string; jobTitle: string }) => ({
            employeeId: employee.id,
            departmentId: d.departmentId,
            jobTitle: d.jobTitle,
          }))
        );
      }
      return { success: true, id: employee.id };
    });
  });

export const deleteEmployeesProcedure = protectedProcedure([
  "BasicInfoManagement",
])
  .input(selectionInputSchema)
  .mutation(async ({ input }) => {
    let employeeIds: string[];
    if ("selectedIds" in input) {
      employeeIds = input.selectedIds;
    } else {
      const term = `%${input.searchTerm}%`;
      const whereCondition = or(
        ilike(employeesTable.chName, term),
        ilike(employeesTable.enName, term),
        ilike(employeesTable.email, term),
        ilike(employeesTable.idNumber, term),
        ilike(employeesTable.phone, term),
        ilike(employeesTable.email, term)
      );

      const employees = await db
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            whereCondition,
            notInArray(employeesTable.id, input.deSelectedIds)
          )
        );
      employeeIds = employees.map((e) => e.id);
    }

    if (employeeIds.length === 0) {
      return { success: true, count: 0 };
    }

    return db.transaction(async (tx) => {
      // Remove department associations
      await tx
        .delete(employeeDepartmentsTable)
        .where(inArray(employeeDepartmentsTable.employeeId, employeeIds));
      // Remove users
      await tx
        .delete(usersTable)
        .where(inArray(usersTable.employeeId, employeeIds));
      // Remove app user permissions (must delete before removing app users)
      const appUsers = await tx
        .select({ id: appUsersTable.id })
        .from(appUsersTable)
        .where(inArray(appUsersTable.employeeId, employeeIds));
      const appUserIds = appUsers.map((u) => u.id);
      if (appUserIds.length > 0) {
        await tx
          .delete(appUserPermissions)
          .where(inArray(appUserPermissions.appUserId, appUserIds));
      }
      // Remove app users
      await tx
        .delete(appUsersTable)
        .where(inArray(appUsersTable.employeeId, employeeIds));
      // Remove employees
      await tx
        .delete(employeesTable)
        .where(inArray(employeesTable.id, employeeIds));
      return { success: true, count: employeeIds.length };
    });
  });
