import { departmentsTable } from "@myapp/shared";
import { db } from "../../db";
import { PERMISSION_NAMES } from "../../db/permissions";
import { protectedProcedure } from "../core";

export const readDepartmentsProcedure = protectedProcedure(
  PERMISSION_NAMES.DEPARTMENT_READ
).query(async () => {
  const departments = await db.select().from(departmentsTable);

  return departments.map((e) => {
    const { updated_at, created_at, ...rest } = e;
    return rest;
  });
});
