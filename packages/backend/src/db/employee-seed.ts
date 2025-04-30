import { db } from "./index.js";
import {
  employeesTable,
  employeeDepartmentsTable,
  EmployeeFromDb,
} from "./schema.js";
import { randomUUID } from "crypto";

export interface DepartmentConfig {
  departmentId: string;
  count: number;
  chPrefix: string;
  enPrefix: string;
}

/**
 * Seeds employees and assigns them to departments.
 * @param departments Array of { departmentId, count, chNamePrefix }
 * @returns Array of created employee IDs
 */
export async function seedEmployees(departments: DepartmentConfig[]) {
  const employees: (EmployeeFromDb & { departmentId: string })[] = [];
  let globalIndex = 1;
  for (const dept of departments) {
    for (let i = 0; i < dept.count; i++) {
      const id = randomUUID();

      const emps = await db
        .insert(employeesTable)
        .values({
          id,
          idNumber: `${dept.enPrefix}${String(i + 1).padStart(3, "0")}`,
          chName: `${dept.chPrefix || "員工"}${i + 1}`,
          enName: `John Doe ${i + 1}`,
          birthday: new Date(Math.floor(Math.random() * 40 * 365 * 24 * 60 * 60 * 1000) + 946684800000),
          gender: globalIndex % 2 === 0 ? "male" : "female",
          marital_status: ["single", "married", "divorced"][Math.floor(Math.random() * 3)],
          education: ["high school", "bachelor", "master", "phd"][Math.floor(Math.random() * 4)],
          phone1: `09${Math.floor(100000000 + Math.random() * 899999999)}`,
          email: `john.doe.${i + 1}@example.com`,
          residenceCounty: ["台北市", "新北市", "桃園市"][Math.floor(Math.random() * 3)],
          residenceDistrict: ["中正區", "信義區", "大安區"][Math.floor(Math.random() * 3)],
          residenceAddress: `台北市中正區${Math.floor(Math.random() * 100)}號`,
          mailingCounty: ["台北市", "新北市", "桃園市"][Math.floor(Math.random() * 3)],
          mailingDistrict: ["中正區", "信義區", "大安區"][Math.floor(Math.random() * 3)],
          mailingAddress: `台北市中正區${Math.floor(Math.random() * 100)}號`,
        })
        .returning();

      await db.insert(employeeDepartmentsTable).values({
        id: randomUUID(),
        employeeId: id,
        departmentId: dept.departmentId,
        jobTitle: ["總理", "主管", "員工"][Math.floor(Math.random() * 3)],
      });
      globalIndex++;

      employees.push({
        ...emps[0],
        departmentId: dept.departmentId,
      });
    }
  }
  return employees;
}
