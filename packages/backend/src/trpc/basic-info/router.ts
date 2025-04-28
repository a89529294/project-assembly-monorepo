import {
  createCompanyInfoProcedure,
  getCompanyInfoProcedure,
  getEmployeesProcedure,
  updateCompanyInfoProcedure,
  uploadCompanyLogoProcedure,
} from "./procedures.js";
import { router } from "../core.js";

export const basicInfoRouter = router({
  getEmployees: getEmployeesProcedure,
  readCompanyInfo: getCompanyInfoProcedure,
  createCompanyInfo: createCompanyInfoProcedure,
  updateCompanyInfo: updateCompanyInfoProcedure,
  uploadCompanyLogo: uploadCompanyLogoProcedure,
});
