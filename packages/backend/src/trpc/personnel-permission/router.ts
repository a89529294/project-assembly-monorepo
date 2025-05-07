import { router } from "../core.js";
import {
  readAssignedDepartmentsProcedure,
  readDepartmentsProcedure,
  readUnassignedDepartmentsProcedure,
} from "./department-prodecures.js";
import {
  createUserWithRolesProcedure,
  readAppUsersByPermissionProcedure,
} from "./procedures.js";
import {
  createUsersFromEmployeesProcedure,
  readUsersProcedure,
} from "./user-procedures.js";

export const personnelPermissionRouter = router({
  createUserWithRoles: createUserWithRolesProcedure,
  readUsers: readUsersProcedure,
  createUsersFromEmployees: createUsersFromEmployeesProcedure,
  readAppUserByPermission: readAppUsersByPermissionProcedure,
  readDepartments: readDepartmentsProcedure,
  readUnassignedDepartments: readUnassignedDepartmentsProcedure,
  readAssignedDepartments: readAssignedDepartmentsProcedure,
});
