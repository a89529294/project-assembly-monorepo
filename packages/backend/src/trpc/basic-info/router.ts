import { getEmployeesProcedure } from "./procedures.js";
import { router } from "../core.js";

export const basicInfoRouter = router({
  getEmployees: getEmployeesProcedure,
});
