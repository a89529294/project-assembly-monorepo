import {
  createCompanyInfoProcedure,
  readCompanyInfoProcedure,
  updateCompanyInfoProcedure,
} from "./company-procedures.js";
import {
  createEmployeeProcedure,
  deleteEmployeesProcedure,
  readEmployeeByIdProcedure,
  readEmployeesProcedure,
  updateEmployeeByIdProcedure,
} from "./employee-procedures.js";
import { router } from "../core.js";
import {
  createCustomerProcedure,
  deleteCustomersProcedure,
  readCustomerProcedure,
  readCustomersProcedure,
  updateCustomerProcedure,
} from "./customers-procedures.js";
import {
  checkBomProcessStatusProcedure,
  createProjectProcedure,
  onAddBomToProcessQueueProcedure,
  readCustomerProjectsProcedure,
  readProjectContactsProcedure,
  readProjectProcedure,
  updateProjectProcedure,
} from "./projects-procedures.js";

export const basicInfoRouter = router({
  createEmployee: createEmployeeProcedure,
  readEmployees: readEmployeesProcedure,
  readEmployeeById: readEmployeeByIdProcedure,
  updateEmployeeById: updateEmployeeByIdProcedure,
  deleteEmployees: deleteEmployeesProcedure,
  readCompanyInfo: readCompanyInfoProcedure,
  createCompanyInfo: createCompanyInfoProcedure,
  updateCompanyInfo: updateCompanyInfoProcedure,
  readCustomers: readCustomersProcedure,
  createCustomer: createCustomerProcedure,
  readCustomer: readCustomerProcedure,
  updateCustomer: updateCustomerProcedure,
  deleteCustomers: deleteCustomersProcedure,
  createProject: createProjectProcedure,
  updateProject: updateProjectProcedure,
  readCustomerProjects: readCustomerProjectsProcedure,
  readProject: readProjectProcedure,
  readProjectContacts: readProjectContactsProcedure,
  onAddBomToProcessQueue: onAddBomToProcessQueueProcedure,
  checkBomProcessStatus: checkBomProcessStatusProcedure,
});
