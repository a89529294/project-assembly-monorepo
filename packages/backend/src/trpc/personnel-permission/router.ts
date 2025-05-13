import { router } from "../core.js";
import {
  deleteAppUsersPermissionProcedure,
  grantPermissionMutationProcedure,
  readAppUsersByPermissionProcedure,
  readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermissionProcedure,
} from "./app-users-procedures.js";
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
  createUsersFromEmployeesProcedure,
  createUserWithRolesProcedure,
  deleteUsersProcedure,
  generatePasswordForUserProcedure,
  readUsersProcedure,
} from "./user-procedures.js";

export const personnelPermissionRouter = router({
  createUserWithRoles: createUserWithRolesProcedure,
  readUsers: readUsersProcedure,
  createUsersFromEmployees: createUsersFromEmployeesProcedure,
  deleteUsers: deleteUsersProcedure,
  generatePasswordForUser: generatePasswordForUserProcedure,
  readAppUserByPermission: readAppUsersByPermissionProcedure,
  readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermission:
    readEmployeesWithNoAppUserOrAppUsersWithoutTheSpecificPermissionProcedure,
  deleteAppUsersPermission: deleteAppUsersPermissionProcedure,
  grantEmployeeOrAppUserPermission: grantPermissionMutationProcedure,
  readDepartments: readDepartmentsProcedure,
  readUnassignedDepartments: readUnassignedDepartmentsProcedure,
  readAssignedDepartments: readAssignedDepartmentsProcedure,
  addDepartmentsToRole: addDepartmentsToRoleProcedure,
  removeDepartmentsFromRole: removeDepartmentsFromRoleProcedure,
  readDepartmentUsers: readDepartmentUsersProcedure,
  updateUserDepartmentRelation: updateUserDepartmentRelationProcedure,
});
