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
  readDepartmentByIdProcedure,
  createDepartmentProcedure,
  readDepartmentUsersProcedure,
  readUnassignedDepartmentsProcedure,
  removeDepartmentsFromRoleProcedure,
  updateUserDepartmentRelationProcedure,
  updateDepartmentProcedure,
  deleteDepartmentProcedure,
  readAllDepartmentsProcedure,
  readPaginatedDepartmentsProcedure,
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
  readAllDepartments: readAllDepartmentsProcedure,
  readPaginatedDepartments: readPaginatedDepartmentsProcedure,
  createDepartment: createDepartmentProcedure,
  readDepartmentById: readDepartmentByIdProcedure,
  updateDepartment: updateDepartmentProcedure,
  deleteDepartment: deleteDepartmentProcedure,
  readUnassignedDepartments: readUnassignedDepartmentsProcedure,
  readAssignedDepartments: readAssignedDepartmentsProcedure,
  addDepartmentsToRole: addDepartmentsToRoleProcedure,
  removeDepartmentsFromRole: removeDepartmentsFromRoleProcedure,
  readDepartmentUsers: readDepartmentUsersProcedure,
  updateUserDepartmentRelation: updateUserDepartmentRelationProcedure,
});
