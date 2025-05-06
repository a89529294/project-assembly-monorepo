import {
  createCompanyInfoProcedure,
  readCompanyInfoProcedure,
  updateCompanyInfoProcedure,
} from "./company-procedures.js";
import {
  createEmployeeProcedure,
  readEmployeeByIdProcedure,
  readEmployeesProcedure,
  updateEmployeeByIdProcedure,
} from "./employee-procedures.js";
import { router } from "../core.js";
import { readDepartmentsProcedure } from "./department-prodecures.js";
import {
  createUsersFromEmployeesProcedure,
  readUsersProcedure,
} from "./user-procedures.js";

export const basicInfoRouter = router({
  readEmployees: readEmployeesProcedure,
  readEmployeeById: readEmployeeByIdProcedure,
  updateEmployeeById: updateEmployeeByIdProcedure,
  createEmployee: createEmployeeProcedure,
  readDepartments: readDepartmentsProcedure,
  readCompanyInfo: readCompanyInfoProcedure,
  createCompanyInfo: createCompanyInfoProcedure,
  updateCompanyInfo: updateCompanyInfoProcedure,
  readUsers: readUsersProcedure,
  createUsers: createUsersFromEmployeesProcedure,
});
