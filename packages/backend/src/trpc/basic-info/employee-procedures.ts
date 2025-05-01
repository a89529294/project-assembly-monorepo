import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
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

export const getEmployeesProcedure = protectedProcedure(
  PERMISSION_NAMES.EMPLOYEE_READ
).query(async () => {
  const employees = await db.select().from(employeesTable);

  return employees.map((e) => {
    const { updated_at, created_at, ...rest } = e;
    return rest;
  });
});

export const getEmployeeByIdProcedure = protectedProcedure(
  PERMISSION_NAMES.EMPLOYEE_READ
)
  .input(z.string())
  .output(employeeSelectSchema)
  .query(async ({ input }) => {
    const employees = await db
      .select()
      .from(employeesTable)
      .innerJoin(
        employeeDepartmentsTable,
        eq(employeeDepartmentsTable.employeeId, employeesTable.id)
      )
      .innerJoin(
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
      employee.departments.push({
        departmentId: e.departments.id,
        departmentName: e.departments.name,
        jobTitle: e.employee_departments.jobTitle ?? "",
      });
    });

    return employee;
  });

export const updateEmployeeByIdProceedure = protectedProcedure(
  PERMISSION_NAMES.EMPLOYEE_UPDATE
)
  .input(
    z.object({
      id: z.string().min(1),
      payload: employeeSelectSchema,
    })
  )
  .mutation(async ({ input }) => {
    console.log(input);
    // return db.transaction(async (tx) => {
    //   const { departments, ...employeeData } = input.payload;
    //   // Update employee
    //   await tx
    //     .update(employeesTable)
    //     .set(employeeData)
    //     .where(eq(employeesTable.id, input.id));
    //   // Update department associations
    //   await tx
    //     .delete(employeeDepartmentsTable)
    //     .where(eq(employeeDepartmentsTable.employeeId, input.id));
    //   if (input.payload.departments?.length) {
    //     await tx.insert(employeeDepartmentsTable).values(
    //       input.payload.departments.map((d) => ({
    //         employeeId: input.id,
    //         departmentId: d.departmentId,
    //         jobTitle: d.jobTitle,
    //       }))
    //     );
    //   }
    //   return { success: true };
    // });
  });
