import { TRPCError } from "@trpc/server";
import { eq, count } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { PERMISSION_NAMES } from "../../db/permissions.js";
import {
  departmentsTable,
  employeeDepartmentsTable,
  employeesTable,
} from "../../db/schema.js";
import { protectedProcedure } from "../core.js";
import { employeeSelectSchema } from "@myapp/shared";

export const readEmployeesProcedure = protectedProcedure(
  PERMISSION_NAMES.EMPLOYEE_READ
)
  .input(
    z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(10),
    })
  )
  .query(async ({ input }) => {
    const { page, pageSize } = input;
    const offset = (page - 1) * pageSize;

    // Get total count
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(employeesTable);

    // Get paginated data
    const employees = await db
      .select()
      .from(employeesTable)
      .limit(pageSize)
      .offset(offset);

    const data = employees.map((e) => {
      const { updated_at, created_at, ...rest } = e;
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

export const readEmployeeByIdProcedure = protectedProcedure(
  PERMISSION_NAMES.EMPLOYEE_READ
)
  .input(z.string())
  .output(employeeSelectSchema)
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

export const updateEmployeeByIdProcedure = protectedProcedure(
  PERMISSION_NAMES.EMPLOYEE_UPDATE
)
  .input(
    z.object({
      id: z.string().min(1),
      payload: employeeSelectSchema,
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
      if (input.payload.departments?.length) {
        await tx.insert(employeeDepartmentsTable).values(
          input.payload.departments.map((d) => ({
            employeeId: input.id,
            departmentId: d.departmentId,
            jobTitle: d.jobTitle,
          }))
        );
      }
      return { success: true };
    });
  });

export const createEmployeeProcedure = protectedProcedure(
  PERMISSION_NAMES.EMPLOYEE_CREATE
)
  .input(
    z.object({
      payload: employeeSelectSchema,
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
