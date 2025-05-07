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

export const basicInfoRouter = router({
  readEmployees: readEmployeesProcedure,
  readEmployeeById: readEmployeeByIdProcedure,
  updateEmployeeById: updateEmployeeByIdProcedure,
  createEmployee: createEmployeeProcedure,
  readCompanyInfo: readCompanyInfoProcedure,
  createCompanyInfo: createCompanyInfoProcedure,
  updateCompanyInfo: updateCompanyInfoProcedure,
});
