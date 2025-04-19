import {
  createUserForEmployeeProcedure,
  createUserWithRolesProcedure,
  getAppUsersByPermissionProcedure,
} from "./procedures.js";
import { router } from "../core.js";

export const personnelPermissionRouter = router({
  createUserForEmployee: createUserForEmployeeProcedure,
  createUserWithRoles: createUserWithRolesProcedure,
  getAppUserByPermission: getAppUsersByPermissionProcedure,
});
