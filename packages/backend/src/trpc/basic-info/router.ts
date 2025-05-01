import {
  createCompanyInfoProcedure,
  getCompanyInfoProcedure,
  updateCompanyInfoProcedure,
} from "./company-procedures.js";
import {
  getEmployeeByIdProcedure,
  getEmployeesProcedure,
  updateEmployeeByIdProceedure,
} from "./employee-procedures.js";
import { router } from "../core.js";
import { getDepartmentsProcedure } from "./department-prodecures.js";

export const basicInfoRouter = router({
  getEmployees: getEmployeesProcedure,
  getEmployeeById: getEmployeeByIdProcedure,
  updateEmployeeById: updateEmployeeByIdProceedure,
  getDepartments: getDepartmentsProcedure,
  readCompanyInfo: getCompanyInfoProcedure,
  createCompanyInfo: createCompanyInfoProcedure,
  updateCompanyInfo: updateCompanyInfoProcedure,
});
