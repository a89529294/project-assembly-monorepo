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
  roleNameEnum,
} from "./schema.js";
import { db } from "./index.js";
import { randomUUID } from "crypto";
import { seedEmployees, DepartmentConfig } from "./employee-seed.js";

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
  //設定
  const basicInfoManagementRoleId = randomUUID();
  //客戶管理
  const customerManagementRoleId = randomUUID();
  //倉庫管理
  const storageManagementRoleId = randomUUID();

  const productionManagementRoleId = randomUUID();

  const roles = [
    {
      id: adminRoleId,
      name: roleNameEnum.enumValues[0], // important if you change this you have to update frontend
      chinese_name: "管理員",
    },
    {
      id: basicInfoManagementRoleId,
      name: roleNameEnum.enumValues[1], // important if you change this you have to update frontend
      chinese_name: "設定",
    },
    {
      id: customerManagementRoleId,
      name: roleNameEnum.enumValues[2], // important if you change this you have to update frontend
      chinese_name: "客戶管理",
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
      en_prefix: "HR",
      zh_prefix: "人資",
    },
    {
      id: financeDeptId,
      name: "Finance",
      en_prefix: "FIN",
      zh_prefix: "財務",
    },
    {
      id: marketingDeptId,
      name: "Marketing",
      en_prefix: "MKT",
      zh_prefix: "行銷",
    },
    {
      id: salesDeptId,
      name: "Sales",
      en_prefix: "SAL",
      zh_prefix: "銷售",
    },
    {
      id: engineeringDeptId,
      name: "Engineering",
      en_prefix: "ENG",
      zh_prefix: "工程",
    },
    {
      id: productDeptId,
      name: "Product",
      en_prefix: "PRD",
      zh_prefix: "產品",
    },
    {
      id: operationsDeptId,
      name: "Operations",
      en_prefix: "OPS",
      zh_prefix: "營運",
    },
    {
      id: customerServiceDeptId,
      name: "Customer Service",
      en_prefix: "CS",
      zh_prefix: "客服",
    },
    {
      id: researchDeptId,
      name: "Research",
      en_prefix: "RND",
      zh_prefix: "研發",
    },
    {
      id: legalDeptId,
      name: "Legal",
      en_prefix: "LEG",
      zh_prefix: "法律",
    },
  ];

  await db.insert(departmentsTable).values(departments);
  console.log("Departments created!");

  // Create role-department associations
  const roleDepartments = [
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

    // Customer Management
    {
      id: randomUUID(),
      roleId: customerManagementRoleId,
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

    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: financeDeptId,
    },
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: marketingDeptId,
    },
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: salesDeptId,
    },
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: customerServiceDeptId,
    },
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: legalDeptId,
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
      roleId: customerManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "personnelPermission:read",
      roleId: customerManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "personnelPermission:update",
      roleId: customerManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "personnelPermission:delete",
      roleId: customerManagementRoleId,
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
    {
      id: randomUUID(),
      name: "company-info:create",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "company-info:read",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "company-info:update",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "appUser:create",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "appUser:read",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "appUser:update",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "appUser:delete",
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

  // --- Bulk create employees, users, and appUsers ---
  const NUM_USERS = 30;
  const NUM_APP_USERS = 20;
  const DEFAULT_PASSWORD_HASH =
    "$argon2id$v=19$m=19456,t=2,p=1$EGTc0PR3V8ihyus3qz/WJA$sbAvDU2mZOJw7XkmKzeBQl79a6JiJUaGTthKJuh+mP0";

  // 1. Create employees per department (dynamic, random count, uses zh_prefix)
  const allDepartments = await db.select().from(departmentsTable);
  const departmentConfigs: DepartmentConfig[] = allDepartments.map((dept) => ({
    departmentId: dept.id,
    count: Math.floor(Math.random() * 10) + 1, // 1 to 10 employees
    chPrefix: dept.zh_prefix,
    enPrefix: dept.en_prefix,
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
  const numRegularUsers = Math.min(28, availableEmployees);
  const numAppUsers = Math.min(20, availableEmployees);

  for (let i = 0; i < numRegularUsers; i++) {
    await db.insert(usersTable).values({
      id: randomUUID(),
      account: employeesFromDB[i].idNumber,
      name: employeesFromDB[i].chName,
      employeeId: employeesFromDB[i].id,
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
        "$argon2id$v=19$m=19456,t=2,p=1$7plTOkhlpe84tk5lqAZoQw$qoWYFqavEmYzpzdOOzQyIgnURp/wwqL0kohWCER4x84",
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
    await db.insert(appUserPermissions).values({
      id: randomUUID(),
      appUserId: appUsers[i].id,
      permission: permissionsList[i % permissionsList.length],
    });
  }

  console.log("Users and employees created!");

  console.log("Database seed completed successfully!");
}

main();
