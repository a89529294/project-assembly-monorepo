import { publicProcedure } from "../core.js";
import { db } from "../../db/index.js";
import { employeesTable } from "../../db/schema.js";

export const getEmployeesProcedure = publicProcedure.query(async () => {
  return db.select().from(employeesTable);
});
