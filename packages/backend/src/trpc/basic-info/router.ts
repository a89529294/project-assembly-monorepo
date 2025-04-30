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

export const basicInfoRouter = router({
  getEmployees: getEmployeesProcedure,
  getEmployeeById: getEmployeeByIdProcedure,
  updateEmployeeById: updateEmployeeByIdProceedure,
  readCompanyInfo: getCompanyInfoProcedure,
  createCompanyInfo: createCompanyInfoProcedure,
  updateCompanyInfo: updateCompanyInfoProcedure,
});
