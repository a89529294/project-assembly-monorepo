// import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import {
  usersTable,
  rolesTable,
  sessionsTable,
  customersTable,
  projectsTable,
  contactsTable,
  projectContactsTable,
  departmentsTable,
  userRolesTable,
  roleDepartmentsTable,
  employeesTable,
  employeeDepartmentsTable,
  appUsersTable,
  appUserPermissionsTable,
  appUserRefreshTokensTable,
  roleNameEnum,
} from "./schema.js";
import { db } from "./index.js";
import { randomUUID } from "crypto";
import { seedEmployees, DepartmentConfig } from "./employee-seed.js";
// import { syncPermissionsToDB } from "./permissions.js";
import { roleIds } from "./roles.js";

// const envPath = `.env.${process.env.NODE_ENV}`;
// dotenv.config({ path: envPath });

async function main() {
  console.log("Starting database seed...");

  // Clean all tables before seeding (order matters for FKs)
  // await db.delete(appUserRefreshTokensTable);
  // await db.delete(appUserPermissionsTable);
  // await db.delete(userRolesTable);
  // await db.delete(roleDepartmentsTable);
  // await db.delete(sessionsTable);
  // await db.delete(projectContactsTable);
  // await db.delete(employeeDepartmentsTable);
  // await db.delete(usersTable);
  // await db.delete(appUsersTable);
  // await db.delete(employeesTable);
  // await db.delete(departmentsTable);
  // await db.delete(rolesTable);
  // await db.delete(projectsTable);
  // await db.delete(contactsTable);
  // await db.delete(customersTable);

  // Set role IDs for permissions.ts
  const {
    adminRoleId,
    basicInfoManagementRoleId,
    personnelPermissionManagementRoleId,
    storageManagementRoleId,
    productionManagementRoleId,
  } = roleIds;

  const roles = [
    {
      id: adminRoleId,
      name: roleNameEnum.enumValues[0], // important if you change this you have to update frontend
      chinese_name: "管理員",
    },
    {
      id: basicInfoManagementRoleId,
      name: roleNameEnum.enumValues[1], // important if you change this you have to update frontend
      chinese_name: "基本資料",
    },
    {
      id: personnelPermissionManagementRoleId,
      name: roleNameEnum.enumValues[2], // important if you change this you have to update frontend
      chinese_name: "人事權限",
    },

    {
      id: storageManagementRoleId,
      name: roleNameEnum.enumValues[3], // important this is used to identify storageManagement role
      chinese_name: "倉庫管理",
    },
    {
      id: productionManagementRoleId,
      name: roleNameEnum.enumValues[4], // important if you change this you have to update frontend
      chinese_name: "生產管理",
    },
  ];

  await db.insert(rolesTable).values(roles);
  console.log("Roles created!");

  // Sync permissions from code to DB
  // await syncPermissionsToDB();

  // Create departments
  const hrDeptId = randomUUID();
  const financeDeptId = randomUUID();
  const marketingDeptId = randomUUID();
  const salesDeptId = randomUUID();
  const engineeringDeptId = randomUUID();
  const productDeptId = randomUUID();
  const operationsDeptId = randomUUID();
  const customerServiceDeptId = randomUUID();
  const researchDeptId = randomUUID();
  const legalDeptId = randomUUID();

  const departments = [
    {
      id: hrDeptId,
      name: "人資部",
      enPrefix: "HR",
      zhPrefix: "人資",
    },
    {
      id: financeDeptId,
      name: "財務部",
      enPrefix: "FIN",
      zhPrefix: "財務",
    },
    {
      id: marketingDeptId,
      name: "行銷部",
      enPrefix: "MKT",
      zhPrefix: "行銷",
    },
    {
      id: salesDeptId,
      name: "銷售部",
      enPrefix: "SAL",
      zhPrefix: "銷售",
    },
    {
      id: engineeringDeptId,
      name: "工程部",
      enPrefix: "ENG",
      zhPrefix: "工程",
    },
    {
      id: productDeptId,
      name: "產品部",
      enPrefix: "PRD",
      zhPrefix: "產品",
    },
    {
      id: operationsDeptId,
      name: "營運部",
      enPrefix: "OPS",
      zhPrefix: "營運",
    },
    {
      id: customerServiceDeptId,
      name: "客服部",
      enPrefix: "CS",
      zhPrefix: "客服",
    },
    {
      id: researchDeptId,
      name: "研發部",
      enPrefix: "RND",
      zhPrefix: "研發",
    },
    {
      id: legalDeptId,
      name: "法律部",
      enPrefix: "LEG",
      zhPrefix: "法律",
    },
  ];

  await db.insert(departmentsTable).values(departments);
  console.log("Departments created!");

  // Create role-department associations
  const roleDepartments = [
    // Basic Info Management role in multiple departments
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: hrDeptId,
    },
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: operationsDeptId,
    },

    // personnel permission Management
    {
      id: randomUUID(),
      roleId: personnelPermissionManagementRoleId,
      departmentId: hrDeptId,
    },
    {
      id: randomUUID(),
      roleId: personnelPermissionManagementRoleId,
      departmentId: legalDeptId,
    },

    // Storage Management role in Operations department
    {
      id: randomUUID(),
      roleId: storageManagementRoleId,
      departmentId: operationsDeptId,
    },

    // Production Management
    {
      id: randomUUID(),
      roleId: productionManagementRoleId,
      departmentId: engineeringDeptId,
    },
    {
      id: randomUUID(),
      roleId: productionManagementRoleId,
      departmentId: operationsDeptId,
    },
    {
      id: randomUUID(),
      roleId: productionManagementRoleId,
      departmentId: researchDeptId,
    },
  ];

  await db.insert(roleDepartmentsTable).values(roleDepartments);
  console.log("Role-Department associations created!");

  // --- Bulk create employees, users, and appUsers ---
  const NUM_USERS = 30;
  const NUM_APP_USERS = 20;
  const DEFAULT_PASSWORD_HASH =
    "$argon2id$v=19$m=19456,t=2,p=1$EGTc0PR3V8ihyus3qz/WJA$sbAvDU2mZOJw7XkmKzeBQl79a6JiJUaGTthKJuh+mP0";

  // 1. Create employees per department (dynamic, random count, uses zh_prefix)
  const allDepartments = await db.select().from(departmentsTable);
  const departmentConfigs: DepartmentConfig[] = allDepartments.map((dept) => ({
    departmentId: dept.id,
    count: Math.floor(Math.random() * 100) + 1, // 1 to 100 employees
    chPrefix: dept.zhPrefix,
    enPrefix: dept.enPrefix,
  }));

  const employeesFromDB = await seedEmployees(departmentConfigs);

  // --- Give at least 5 employees an extra department ---
  // Fetch all departments again for assignment
  const allDepartmentsAgain = await db.select().from(departmentsTable);
  const employeeDepartmentsToAdd = [];
  for (let i = 0; i < Math.min(5, employeesFromDB.length); i++) {
    const emp = employeesFromDB[i];
    // Pick a department different from the employee's current one
    const otherDept = allDepartmentsAgain.find(
      (d) => d.id !== emp.departmentId
    );
    if (otherDept) {
      employeeDepartmentsToAdd.push({
        id: randomUUID(),
        employeeId: emp.id,
        departmentId: otherDept.id,
        jobTitle: "員工",
      });
    }
  }
  if (employeeDepartmentsToAdd.length > 0) {
    await db.insert(employeeDepartmentsTable).values(employeeDepartmentsToAdd);
  }

  // 2. Create 2 admin users (not linked to employee)
  const adminUsers = [
    { account: "admin", name: "管理員" },
    { account: "admin2", name: "管理員二號" },
  ];
  for (const admin of adminUsers) {
    const adminId = randomUUID();
    await db.insert(usersTable).values({
      id: adminId,
      account: admin.account,
      name: admin.name,
      passwordHash: DEFAULT_PASSWORD_HASH,
      // no employeeId
    });
    // Assign admin role via userRolesTable
    await db.insert(userRolesTable).values({
      id: randomUUID(),
      userId: adminId,
      roleId: adminRoleId,
    });
  }

  // 3. Create regular users, each linked to a unique employee
  const availableEmployees = employeesFromDB.length;
  const numRegularUsers = Math.floor(availableEmployees / 10);
  const numAppUsers = Math.min(20, availableEmployees);

  for (let i = 0; i < numRegularUsers; i++) {
    const idx = i * 10;
    await db.insert(usersTable).values({
      id: randomUUID(),
      account: employeesFromDB[idx].idNumber,
      name: employeesFromDB[idx].chName,
      employeeId: employeesFromDB[idx].id,
      passwordHash: DEFAULT_PASSWORD_HASH,
    });
  }

  // 4. Create appUsers, each linked to a unique employee
  for (let i = 0; i < numAppUsers; i++) {
    await db.insert(appUsersTable).values({
      id: randomUUID(),
      account: employeesFromDB[i].idNumber,
      employeeId: employeesFromDB[i].id,
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$fzeSLfQlQRhJsr68FPaZUw$g/7mDLYFNOi4zmqCE7MILrTQXwNq9fU/Cunz8Tgc864",
    });
  }

  // --- Grant every appUser at least one permission ---
  const appUsers = await db.select().from(appUsersTable);
  const permissionsList = [
    "man-production",
    "ctr-gdstd",
    "monitor-weight",
  ] as const;
  for (let i = 0; i < appUsers.length; i++) {
    await db.insert(appUserPermissionsTable).values({
      id: randomUUID(),
      appUserId: appUsers[i].id,
      permission: permissionsList[i % permissionsList.length],
    });
  }

  console.log("Users and employees created!");

  // --- Add 30 sample customers ---
  const customers = Array.from({ length: 30 }, (_, i) => ({
    id: randomUUID(),
    name: `Customer ${i + 1}`,
    phone: `+852${Math.floor(1000000 + Math.random() * 9000000)}`,
    customerNumber: `CUST-${String(i + 1).padStart(3, "0")}`,
    nickname: `Cust${i + 1}`,
    taxId: `TAX${Math.floor(10000 + Math.random() * 90000)}`,
    email: `customer${i + 1}@example.com`,
    contactPerson: `Contact ${i + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(customersTable).values(customers);

  console.log("Customers created!");

  console.log("Database seed completed successfully!");
}

main();
