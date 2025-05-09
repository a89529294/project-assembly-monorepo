import { router } from "../core.js";
import {
  addDepartmentsToRoleProcedure,
  readAssignedDepartmentsProcedure,
  readDepartmentsProcedure,
  readDepartmentUsersProcedure,
  readUnassignedDepartmentsProcedure,
  removeDepartmentsFromRoleProcedure,
  updateUserDepartmentRelationProcedure,
} from "./department-prodecures.js";
import {
  createUserWithRolesProcedure,
  readAppUsersByPermissionProcedure,
} from "./procedures.js";
import {
  createUsersFromEmployeesProcedure,
  deleteUsersProcedure,
  generatePasswordForUserProcedure,
  readUsersProcedure,
} from "./user-procedures.js";

export const personnelPermissionRouter = router({
  createUserWithRoles: createUserWithRolesProcedure,
  readUsers: readUsersProcedure,
  createUsersFromEmployees: createUsersFromEmployeesProcedure,
  deleteUsers: deleteUsersProcedure,
  readAppUserByPermission: readAppUsersByPermissionProcedure,
  readDepartments: readDepartmentsProcedure,
  readUnassignedDepartments: readUnassignedDepartmentsProcedure,
  readAssignedDepartments: readAssignedDepartmentsProcedure,
  addDepartmentsToRole: addDepartmentsToRoleProcedure,
  removeDepartmentsFromRole: removeDepartmentsFromRoleProcedure,
  generatePasswordForUser: generatePasswordForUserProcedure,
  readDepartmentUsers: readDepartmentUsersProcedure,
  updateUserDepartmentRelation: updateUserDepartmentRelationProcedure,
});
