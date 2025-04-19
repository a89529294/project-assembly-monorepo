// import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import {
  usersTable,
  rolesTable,
  permissionsTable,
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
  appUserPermissions,
  appUserRefreshTokensTable,
} from "./schema.js";
import { db } from "./index.js";
import { randomUUID } from "crypto";

// const envPath = `.env.${process.env.NODE_ENV}`;
// dotenv.config({ path: envPath });

async function main() {
  console.log("Starting database seed...");

  // Clean all tables before seeding (order matters for FKs)
  await db.delete(appUserRefreshTokensTable);
  await db.delete(appUserPermissions);
  await db.delete(userRolesTable);
  await db.delete(roleDepartmentsTable);
  await db.delete(sessionsTable);
  await db.delete(projectContactsTable);
  await db.delete(employeeDepartmentsTable);
  await db.delete(usersTable);
  await db.delete(appUsersTable);
  await db.delete(employeesTable);
  await db.delete(departmentsTable);
  await db.delete(permissionsTable);
  await db.delete(rolesTable);
  await db.delete(projectsTable);
  await db.delete(contactsTable);
  await db.delete(customersTable);

  // Create roles with predefined IDs
  const adminRoleId = randomUUID();
  const productionManagementRoleId = randomUUID();
  const personnelPermissionManagementRoleId = randomUUID();
  const basicInfoManagementRoleId = randomUUID();
  const storageManagementRoleId = randomUUID();

  const roles = [
    {
      id: adminRoleId,
      name: "AdminManagement", // important this is used to identify admin role
      chinese_name: "管理員",
    },
    {
      id: productionManagementRoleId,
      name: "ProductionManagement", // important this is used to identify production role
      chinese_name: "生產管理",
    },
    {
      id: personnelPermissionManagementRoleId,
      name: "PersonnelPermissionManagement", // important this is used to identify personnelPermission role
      chinese_name: "人事權限",
    },
    {
      id: basicInfoManagementRoleId,
      name: "BasicInfoManagement", // important this is used to identify basicInfo role
      chinese_name: "基本資料",
    },
    {
      id: storageManagementRoleId,
      name: "StorageManagement", // important this is used to identify storageManagement role
      chinese_name: "倉庫管理",
    },
  ];

  await db.insert(rolesTable).values(roles);
  console.log("Roles created!");

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
      name: "Human Resources",
    },
    {
      id: financeDeptId,
      name: "Finance",
    },
    {
      id: marketingDeptId,
      name: "Marketing",
    },
    {
      id: salesDeptId,
      name: "Sales",
    },
    {
      id: engineeringDeptId,
      name: "Engineering",
    },
    {
      id: productDeptId,
      name: "Product",
    },
    {
      id: operationsDeptId,
      name: "Operations",
    },
    {
      id: customerServiceDeptId,
      name: "Customer Service",
    },
    {
      id: researchDeptId,
      name: "Research & Development",
    },
    {
      id: legalDeptId,
      name: "Legal",
    },
  ];

  await db.insert(departmentsTable).values(departments);
  console.log("Departments created!");

  // Create role-department associations
  const roleDepartments = [
    // Production Management role in Engineering, Operations, and R&D departments
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

    // Personnel Management role in HR department
    {
      id: randomUUID(),
      roleId: personnelPermissionManagementRoleId,
      departmentId: hrDeptId,
    },

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
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: productDeptId,
    },

    // Storage Management role in Operations department
    {
      id: randomUUID(),
      roleId: storageManagementRoleId,
      departmentId: operationsDeptId,
    },
  ];

  await db.insert(roleDepartmentsTable).values(roleDepartments);
  console.log("Role-Department associations created!");

  // Create permissions with roleId (now a one-to-many relationship)
  const permissions = [
    // Production Management permissions
    {
      id: randomUUID(),
      name: "production:create",
      roleId: productionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "production:read",
      roleId: productionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "production:update",
      roleId: productionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "production:delete",
      roleId: productionManagementRoleId,
    },

    // Personnel Permission Management permissions
    {
      id: randomUUID(),
      name: "personnelPermission:create",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "personnelPermission:read",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "personnelPermission:update",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "personnelPermission:delete",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "appUser:read",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "appUser:update",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "appUser:create",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "appUser:delete",
      roleId: personnelPermissionManagementRoleId,
    },

    // Basic Info Management permissions
    {
      id: randomUUID(),
      name: "employee:create",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "employee:read",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "employee:update",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "employee:delete",
      roleId: basicInfoManagementRoleId,
    },

    // Storage Management permissions
    {
      id: randomUUID(),
      name: "storage:create",
      roleId: storageManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "storage:read",
      roleId: storageManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "storage:update",
      roleId: storageManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "storage:delete",
      roleId: storageManagementRoleId,
    },
  ];

  await db.insert(permissionsTable).values(permissions);
  console.log("Permissions created!");

  // Create users
  // --- Admin user (no employee, has user_role) ---
  const adminUserId = randomUUID();
  await db.insert(usersTable).values({
    id: adminUserId,
    account: "admin",
    name: "Admin",
    employeeId: null,
    passwordHash:
      "$argon2id$v=19$m=19456,t=2,p=1$EGTc0PR3V8ihyus3qz/WJA$sbAvDU2mZOJw7XkmKzeBQl79a6JiJUaGTthKJuh+mP0", // sample hash
  });
  await db.insert(userRolesTable).values({
    id: randomUUID(),
    userId: adminUserId,
    roleId: adminRoleId,
  });

  // --- Other users: create employee, department mapping, and user ---
  // HR user
  const hrEmployeeId = randomUUID();
  await db.insert(employeesTable).values({
    id: hrEmployeeId,
    idNumber: "hr001",
    chName: "王小明",
    gender: "male",
    phone1: "0912345678",
  });
  await db.insert(employeeDepartmentsTable).values({
    id: randomUUID(),
    employeeId: hrEmployeeId,
    departmentId: hrDeptId,
  });
  const hrUserId = randomUUID();
  await db.insert(usersTable).values({
    id: hrUserId,
    account: "hr001", // match employee idNumber
    name: "王小明",
    employeeId: hrEmployeeId,
    passwordHash:
      "$argon2id$v=19$m=19456,t=2,p=1$EGTc0PR3V8ihyus3qz/WJA$sbAvDU2mZOJw7XkmKzeBQl79a6JiJUaGTthKJuh+mP0",
  });

  // Create app user for HR employee
  const hrAppUserId = randomUUID();
  await db.insert(appUsersTable).values({
    id: hrAppUserId,
    account: "hr001", // same as employee idNumber
    passwordHash:
      "$argon2id$v=19$m=19456,t=2,p=1$uYynoESvp104MjN0NXYc1g$dCuvbbaE9GoeJKmJaSGI8wCmBhBsmt97/2QNpg7zzKM",
    employeeId: hrEmployeeId,
  });
  await db.insert(appUserPermissions).values([
    { id: randomUUID(), appUserId: hrAppUserId, permission: "man-production" },
    { id: randomUUID(), appUserId: hrAppUserId, permission: "ctr-gdstd" },
    { id: randomUUID(), appUserId: hrAppUserId, permission: "monitor-weight" },
  ]);
  console.log("App user for HR created!");

  // Finance user
  const financeEmployeeId = randomUUID();
  await db.insert(employeesTable).values({
    id: financeEmployeeId,
    idNumber: "finance001",
    chName: "李小紅",
    gender: "female",
    phone1: "0922333444",
  });
  await db.insert(employeeDepartmentsTable).values({
    id: randomUUID(),
    employeeId: financeEmployeeId,
    departmentId: financeDeptId,
  });
  const financeUserId = randomUUID();
  await db.insert(usersTable).values({
    id: financeUserId,
    account: "finance001", // match employee idNumber
    name: "李小紅",
    employeeId: financeEmployeeId,
    passwordHash:
      "$argon2id$v=19$m=19456,t=2,p=1$EGTc0PR3V8ihyus3qz/WJA$sbAvDU2mZOJw7XkmKzeBQl79a6JiJUaGTthKJuh+mP0",
  });

  // Create app user for Finance employee (with only one permission)
  const financeAppUserId = randomUUID();
  await db.insert(appUsersTable).values({
    id: financeAppUserId,
    account: "finance001", // same as employee idNumber
    passwordHash:
      "$argon2id$v=19$m=19456,t=2,p=1$lCs2vAWLKYwFGeIU57d0eg$PefujxGXtY1J65Sx63pgPM9m/5uv9272VnsZV64xrXo",
    employeeId: financeEmployeeId,
  });
  await db
    .insert(appUserPermissions)
    .values([
      {
        id: randomUUID(),
        appUserId: financeAppUserId,
        permission: "man-production",
      },
    ]);
  console.log("App user for Finance created!");

  // Marketing user
  const marketingEmployeeId = randomUUID();
  await db.insert(employeesTable).values({
    id: marketingEmployeeId,
    idNumber: "marketing001",
    chName: "趙小明",
    gender: "male",
    phone1: "0933444555",
  });
  await db.insert(employeeDepartmentsTable).values({
    id: randomUUID(),
    employeeId: marketingEmployeeId,
    departmentId: marketingDeptId,
  });
  const marketingUserId = randomUUID();
  await db.insert(usersTable).values({
    id: marketingUserId,
    account: "marketing001", // match employee idNumber
    name: "趙小明",
    employeeId: marketingEmployeeId,
    passwordHash:
      "$argon2id$v=19$m=19456,t=2,p=1$EGTc0PR3V8ihyus3qz/WJA$sbAvDU2mZOJw7XkmKzeBQl79a6JiJUaGTthKJuh+mP0",
  });

  // Sales user
  const salesEmployeeId = randomUUID();
  await db.insert(employeesTable).values({
    id: salesEmployeeId,
    idNumber: "sales001",
    chName: "周小紅",
    gender: "female",
    phone1: "0944555666",
  });
  await db.insert(employeeDepartmentsTable).values({
    id: randomUUID(),
    employeeId: salesEmployeeId,
    departmentId: salesDeptId,
  });
  const salesUserId = randomUUID();
  await db.insert(usersTable).values({
    id: salesUserId,
    account: "sales001", // match employee idNumber
    name: "周小紅",
    employeeId: salesEmployeeId,
    passwordHash:
      "$argon2id$v=19$m=19456,t=2,p=1$EGTc0PR3V8ihyus3qz/WJA$sbAvDU2mZOJw7XkmKzeBQl79a6JiJUaGTthKJuh+mP0",
  });

  // Engineering user
  const engineeringEmployeeId = randomUUID();
  await db.insert(employeesTable).values({
    id: engineeringEmployeeId,
    idNumber: "engineering001",
    chName: "孫小明",
    gender: "male",
    phone1: "0955666777",
  });
  await db.insert(employeeDepartmentsTable).values({
    id: randomUUID(),
    employeeId: engineeringEmployeeId,
    departmentId: engineeringDeptId,
  });
  const engineeringUserId = randomUUID();
  await db.insert(usersTable).values({
    id: engineeringUserId,
    account: "engineering001", // match employee idNumber
    name: "孫小明",
    employeeId: engineeringEmployeeId,
    passwordHash:
      "$argon2id$v=19$m=19456,t=2,p=1$EGTc0PR3V8ihyus3qz/WJA$sbAvDU2mZOJw7XkmKzeBQl79a6JiJUaGTthKJuh+mP0",
  });

  // Multi-department user
  const multiDeptEmployeeId = randomUUID();
  await db.insert(employeesTable).values({
    id: multiDeptEmployeeId,
    idNumber: "multi001",
    chName: "複部門員工",
    gender: "male",
    phone1: "0966777888",
  });
  await db.insert(employeeDepartmentsTable).values({
    id: randomUUID(),
    employeeId: multiDeptEmployeeId,
    departmentId: hrDeptId,
  });
  await db.insert(employeeDepartmentsTable).values({
    id: randomUUID(),
    employeeId: multiDeptEmployeeId,
    departmentId: engineeringDeptId,
  });
  const multiDeptUserId = randomUUID();
  await db.insert(usersTable).values({
    id: multiDeptUserId,
    account: "multi001", // match employee idNumber
    name: "複部門員工",
    employeeId: multiDeptEmployeeId,
    passwordHash:
      "$argon2id$v=19$m=19456,t=2,p=1$EGTc0PR3V8ihyus3qz/WJA$sbAvDU2mZOJw7XkmKzeBQl79a6JiJUaGTthKJuh+mP0",
  });
  console.log("Multi-department employee and user created!");

  console.log("Users and employees created!");

  console.log("Database seed completed successfully!");
}

main();
