import type { InferSelectModel } from "drizzle-orm";
import { eq, relations, sql } from "drizzle-orm";

import {
  boolean,
  integer,
  pgTable,
  pgView,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { AppUserPermission } from "../app-users";
import { employeeColumns, employeesTable } from "./employees";
import {
  appPermissionEnum,
  bomProcessStatusEnum,
  projectStatusEnum,
  roleNameEnum,
} from "./enum";
import { materialsTable } from "./material";
import { processWorkTypeEmployee } from "./process-work-type";
import { projectAssembliesTable } from "./project-assembly";
import { projectAssemblyProcessTable } from "./project-assembly-process";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
const timestampsWithDeletedAt = {
  ...timestamps,
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
};

export const rolesTable = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: roleNameEnum().notNull().unique(),
  chineseName: varchar("chinese_name", { length: 255 }),
  ...timestamps,
});

// export const permissionsTable = pgTable("permissions", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   name: varchar({ length: 100 }).notNull().unique(),
//   // Permission string like "order:create", "order:read", etc.
//   roleId: uuid("role_id")
//     .notNull()
//     .references(() => rolesTable.id),
//   ...timestamps,
// });

export const departmentsTable = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  enPrefix: varchar("en_prefix", { length: 10 }).notNull(),
  zhPrefix: varchar("zh_prefix", { length: 10 }).notNull(),
  ...timestamps,
});

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  account: varchar({ length: 255 }).notNull().unique(), // idNumber from employeesTable if user is linked to an employee
  name: varchar({ length: 255 }).notNull(), // chName from employeesTable
  employeeId: uuid("employee_id")
    .unique()
    .references(() => employeesTable.id),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  ...timestamps,
});

export const employeeDepartmentsTable = pgTable("employee_departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employeesTable.id, { onDelete: "cascade" }),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departmentsTable.id, { onDelete: "cascade" }),
  jobTitle: varchar("job_title", { length: 100 }),
  inheritsDepartmentRoles: boolean("inherits_department_roles").default(true),
  ...timestamps,
});

export const appUsersTable = pgTable("app_users", {
  id: uuid().primaryKey().defaultRandom(),
  account: varchar({ length: 255 }).notNull().unique(), // idNumber from employeesTable
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  employeeId: uuid("employee_id")
    .notNull()
    .unique()
    .references(() => employeesTable.id),
  ...timestamps,
});

export const appUserPermissionsTable = pgTable("app_user_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => appUsersTable.id),
  permission: appPermissionEnum("permission").notNull(),
});

export const roleDepartmentsTable = pgTable("role_departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleId: uuid("role_id")
    .notNull()
    .references(() => rolesTable.id),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departmentsTable.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const userRolesTable = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  roleId: uuid("role_id")
    .notNull()
    .references(() => rolesTable.id),
  ...timestamps,
});

export const sessionsTable = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const customersTable = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerNumber: varchar("customer_number", { length: 50 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  nickname: varchar({ length: 100 }).notNull(),
  category: varchar({ length: 100 }),
  principal: varchar({ length: 100 }),
  taxDeductionCategory: varchar("tax_deduction_category", { length: 100 }),
  taxId: varchar("tax_id", { length: 50 }).notNull(),
  phone: varchar({ length: 50 }).notNull(),
  fax: varchar({ length: 50 }),
  county: varchar({ length: 100 }),
  district: varchar({ length: 100 }),
  address: varchar({ length: 100 }),
  invoiceCounty: varchar("invoice_county", { length: 100 }),
  invoiceDistrict: varchar("invoice_district", { length: 100 }),
  invoiceAddress: varchar("invoice_address", { length: 100 }),
  ...timestampsWithDeletedAt,
});

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectNumber: varchar("project_number", { length: 50 }).notNull(),
  status: projectStatusEnum().notNull().default("pending"),
  name: varchar({ length: 255 }).notNull(),
  county: varchar({ length: 100 }),
  district: varchar({ length: 100 }),
  address: varchar({ length: 100 }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customersTable.id),
  ...timestampsWithDeletedAt,
});

export const contactsTable = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  phone: varchar({ length: 50 }).notNull(),
  enName: varchar("en_name", { length: 100 }),
  lineId: varchar({ length: 100 }),
  weChatId: varchar({ length: 100 }),
  memo: varchar({ length: 500 }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customersTable.id, {
      onDelete: "cascade",
    }),
  ...timestamps,
});

export const projectContactsTable = pgTable("project_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contactsTable.id),
  ...timestamps,
});

export const projectBomImportJobRecordTable = pgTable(
  "project_bom_import_job_record",
  {
    // This is both the primary key and a foreign key to projects.id
    id: uuid("id")
      .primaryKey()
      .references(() => projectsTable.id),
    bomFileEtag: varchar("bom_file_etag", { length: 255 }),
    jobId: varchar("job_id", { length: 255 }),
    status: bomProcessStatusEnum("status").notNull().default("waiting"),
    totalSteps: integer("total_steps"),
    processedSteps: integer("processed_steps"),
    errorMessage: varchar("error_message", { length: 1000 }),
    latestImportedAt: timestamp("latest_imported_at", { withTimezone: true }),
    ...timestamps,
  }
);

export const companyInfoTable = pgTable("company_info", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  county: varchar("county", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  fax: varchar("fax", { length: 50 }).notNull(),
  taxId: varchar("tax_id", { length: 50 }).notNull(),
  logoURL: varchar("logo_link", { length: 255 }),
});

export const employeeOrAppUserWithDepartmentSummaryView = pgView(
  "employee_summary_view"
).as((qb) => {
  // 1. Get employees and their department IDs
  const employeesInDepartments = qb
    .select({
      ...(Object.fromEntries(
        (
          Object.keys(employeeColumns) as Array<keyof typeof employeeColumns>
        ).map((col) => [col, employeesTable[col]])
      ) as {
        [K in keyof typeof employeeColumns]: (typeof employeesTable)[K];
      }),
      department_id: employeeDepartmentsTable.departmentId,
      department_name: departmentsTable.name,
      department_job_title: employeeDepartmentsTable.jobTitle,
    })
    .from(employeesTable)
    .innerJoin(
      employeeDepartmentsTable,
      eq(employeeDepartmentsTable.employeeId, employeesTable.id)
    )
    .innerJoin(
      departmentsTable,
      eq(departmentsTable.id, employeeDepartmentsTable.departmentId)
    )
    .as("employees_in_departments");

  // 2. Employees without app users
  const employeesWithoutUsers = qb
    .select({
      id: employeesInDepartments.id,
      id_number: employeesInDepartments.idNumber,
      name: employeesInDepartments.chName,
      department_id: employeesInDepartments.department_id,
      department_name: employeesInDepartments.department_name,
      department_job_title: employeesInDepartments.department_job_title,
      is_app_user: sql<boolean>`false`.as("is_app_user"),
      permissions: sql<AppUserPermission[]>`ARRAY[]::text[]`.as("permissions"),
    })
    .from(employeesInDepartments)
    .where(
      sql`not exists (
        select 1 from ${appUsersTable} 
        where ${appUsersTable.employeeId} = ${employeesInDepartments.id}
      )`
    )
    .as("employees_without_users");

  // 3. App users with aggregated permissions
  const appUsersWithPermissions = qb
    .select({
      id: appUsersTable.id,
      id_number: employeesInDepartments.idNumber,
      name: employeesInDepartments.chName,
      department_id: employeesInDepartments.department_id,
      department_name: employeesInDepartments.department_name,
      department_job_title: employeesInDepartments.department_job_title,
      is_app_user: sql<boolean>`true`.as("is_app_user"),
      permissions: sql<AppUserPermission[]>`
  COALESCE(ARRAY_REMOVE(ARRAY_AGG(app_user_permissions.permission::text), NULL), ARRAY[]::text[])`.as(
        "permissions"
      ),
    })
    .from(appUsersTable)
    .innerJoin(
      employeesInDepartments,
      sql`${appUsersTable.employeeId} = ${employeesInDepartments.id}`
    )
    .leftJoin(
      appUserPermissionsTable,
      sql`${appUserPermissionsTable.appUserId} = ${appUsersTable.id}`
    )
    .groupBy(
      appUsersTable.id,
      employeesInDepartments.id,
      employeesInDepartments.idNumber,
      employeesInDepartments.chName,
      employeesInDepartments.department_id,
      employeesInDepartments.department_name,
      employeesInDepartments.department_job_title
    )
    .as("app_users_with_permissions");

  // 4. Combine both sources
  return qb.select().from(
    qb
      .select({
        id: employeesWithoutUsers.id,
        id_number: employeesWithoutUsers.id_number,
        name: employeesWithoutUsers.name,
        department_id: employeesWithoutUsers.department_id,
        department_name: employeesWithoutUsers.department_name,
        department_job_title: employeesWithoutUsers.department_job_title,
        is_app_user: employeesWithoutUsers.is_app_user,
        permissions: employeesWithoutUsers.permissions,
      })
      .from(employeesWithoutUsers)
      .unionAll(
        qb
          .select({
            id: appUsersWithPermissions.id,
            id_number: appUsersWithPermissions.id_number,
            name: appUsersWithPermissions.name,
            department_id: appUsersWithPermissions.department_id,
            department_name: appUsersWithPermissions.department_name,
            department_job_title: appUsersWithPermissions.department_job_title,
            is_app_user: appUsersWithPermissions.is_app_user,
            permissions: appUsersWithPermissions.permissions,
          })
          .from(appUsersWithPermissions)
      )
      .as("combined")
  );
});

export const employeeOrAppUserWithoutDepartmentsView = pgView(
  "employees_without_departments_view"
).as((qb) => {
  // 1. Employees without department entries and not app users
  const employeesWithoutDepartments = qb
    .select({
      id: employeesTable.id,
      id_number: employeesTable.idNumber,
      name: employeesTable.chName,
      is_app_user: sql<boolean>`false`.as("is_app_user"),
      permissions: sql<AppUserPermission[]>`ARRAY[]::text[]`.as("permissions"),
    })
    .from(employeesTable)
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM ${employeeDepartmentsTable} 
        WHERE ${employeeDepartmentsTable.employeeId} = ${employeesTable.id}
      ) AND NOT EXISTS (
        SELECT 1 FROM ${appUsersTable} 
        WHERE ${appUsersTable.employeeId} = ${employeesTable.id}
      )`
    )
    .as("employees_without_departments");

  // 2. App users with aggregated permissions (for employees without departments)
  const appUsersWithoutDepartments = qb
    .select({
      id: appUsersTable.id,
      id_number: employeesTable.idNumber,
      name: employeesTable.chName,
      is_app_user: sql<boolean>`true`.as("is_app_user"),
      permissions: sql<AppUserPermission[]>`
        COALESCE(ARRAY_REMOVE(ARRAY_AGG(app_user_permissions.permission::text), NULL), ARRAY[]::text[])`.as(
        "permissions"
      ),
    })
    .from(appUsersTable)
    .innerJoin(
      employeesTable,
      sql`${appUsersTable.employeeId} = ${employeesTable.id}`
    )
    .leftJoin(
      appUserPermissionsTable,
      sql`${appUserPermissionsTable.appUserId} = ${appUsersTable.id}`
    )
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM ${employeeDepartmentsTable} 
        WHERE ${employeeDepartmentsTable.employeeId} = ${employeesTable.id}
      )`
    )
    .groupBy(appUsersTable.id, employeesTable.idNumber, employeesTable.chName)
    .as("app_users_without_departments");

  // 3. Combine both sources like in the original code, but with simplified structure
  return qb.select().from(
    qb
      .select({
        id: employeesWithoutDepartments.id,
        id_number: employeesWithoutDepartments.id_number,
        name: employeesWithoutDepartments.name,
        is_app_user: employeesWithoutDepartments.is_app_user,
        permissions: employeesWithoutDepartments.permissions,
      })
      .from(employeesWithoutDepartments)
      .unionAll(
        qb
          .select({
            id: appUsersWithoutDepartments.id,
            id_number: appUsersWithoutDepartments.id_number,
            name: appUsersWithoutDepartments.name,
            is_app_user: appUsersWithoutDepartments.is_app_user,
            permissions: appUsersWithoutDepartments.permissions,
          })
          .from(appUsersWithoutDepartments)
      )
      .as("combined")
  );
});

export const customersRelations = relations(customersTable, ({ many }) => ({
  projects: many(projectsTable),
  contacts: many(contactsTable),
}));

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  customer: one(customersTable, {
    fields: [projectsTable.customerId],
    references: [customersTable.id],
  }),
  projectContacts: many(projectContactsTable),
  projectAssemblies: many(projectAssembliesTable),
}));

export const contactsRelations = relations(contactsTable, ({ one, many }) => ({
  customer: one(customersTable, {
    fields: [contactsTable.customerId],
    references: [customersTable.id],
  }),
  projectContacts: many(projectContactsTable),
}));

export const projectContactsRelations = relations(
  projectContactsTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [projectContactsTable.projectId],
      references: [projectsTable.id],
    }),
    contact: one(contactsTable, {
      fields: [projectContactsTable.contactId],
      references: [contactsTable.id],
    }),
  })
);

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  // permissions: many(permissionsTable),
  roleDepartments: many(roleDepartmentsTable),
  userRoles: many(userRolesTable),
}));

// export const permissionsRelations = relations(permissionsTable, ({ one }) => ({
//   role: one(rolesTable, {
//     fields: [permissionsTable.roleId],
//     references: [rolesTable.id],
//   }),
// }));

export const departmentsRelations = relations(departmentsTable, ({ many }) => ({
  userDepartments: many(employeeDepartmentsTable),
  roleDepartments: many(roleDepartmentsTable),
}));

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  sessions: many(sessionsTable),
  userRoles: many(userRolesTable),
  employee: one(employeesTable, {
    fields: [usersTable.employeeId],
    references: [employeesTable.id],
  }),
}));

export const appUsersRelations = relations(appUsersTable, ({ one, many }) => ({
  employee: one(employeesTable, {
    fields: [appUsersTable.employeeId],
    references: [employeesTable.id],
  }),
  permissions: many(appUserPermissionsTable),
}));

export const employeeDepartmentsRelations = relations(
  employeeDepartmentsTable,
  ({ one }) => ({
    employee: one(employeesTable, {
      fields: [employeeDepartmentsTable.employeeId],
      references: [employeesTable.id],
    }),
    department: one(departmentsTable, {
      fields: [employeeDepartmentsTable.departmentId],
      references: [departmentsTable.id],
    }),
  })
);

export const roleDepartmentsRelations = relations(
  roleDepartmentsTable,
  ({ one }) => ({
    role: one(rolesTable, {
      fields: [roleDepartmentsTable.roleId],
      references: [rolesTable.id],
    }),
    department: one(departmentsTable, {
      fields: [roleDepartmentsTable.departmentId],
      references: [departmentsTable.id],
    }),
  })
);

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [userRolesTable.roleId],
    references: [rolesTable.id],
  }),
  user: one(usersTable, {
    fields: [userRolesTable.userId],
    references: [usersTable.id],
  }),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

// --- App User Refresh Tokens ---
export const appUserRefreshTokensTable = pgTable("app_user_refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  appUserId: uuid("app_user_id")
    .notNull()
    .references(() => appUsersTable.id),
  expires_at: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  ...timestamps,
});

export const appUserRefreshTokensRelations = relations(
  appUserRefreshTokensTable,
  ({ one }) => ({
    appUser: one(appUsersTable, {
      fields: [appUserRefreshTokensTable.appUserId],
      references: [appUsersTable.id],
    }),
  })
);

export const employeeRelations = relations(employeesTable, ({ many }) => ({
  employeeDepartments: many(employeeDepartmentsTable),
  // Many-to-many with ProcessWorkType
  processWorkTypes: many(processWorkTypeEmployee),

  // One-to-many with ProjectAssemblyProcess (as worker)
  projectAssemblyProcesses: many(projectAssemblyProcessTable),

  // One-to-many with Material (as arrival confirmed employee)
  arrivalConfirmedMaterials: many(materialsTable, {
    relationName: "arrivalConfirmedEmployee",
  }),

  // One-to-many with Material (as stocked by employee)
  stockedMaterials: many(materialsTable, { relationName: "stockedByEmployee" }),

  // One-to-many with Material (as consumed by employee)
  consumedMaterials: many(materialsTable, {
    relationName: "consumedByEmployee",
  }),
}));

// Type definitions for database models
export type RoleFromDb = InferSelectModel<typeof rolesTable>;
// export type PermissionFromDb = InferSelectModel<typeof permissionsTable>;
export type UserFromDb = InferSelectModel<typeof usersTable>;
export type AppUserFromDb = InferSelectModel<typeof appUsersTable>;
export type SessionFromDb = InferSelectModel<typeof sessionsTable>;
export type CustomerFromDb = InferSelectModel<typeof customersTable>;
export type ProjectFromDb = InferSelectModel<typeof projectsTable>;
export type ContactFromDb = InferSelectModel<typeof contactsTable>;
export type ProjectContactFromDb = InferSelectModel<
  typeof projectContactsTable
>;
export type DepartmentFromDb = InferSelectModel<typeof departmentsTable>;
export type EmployeeDepartmentFromDb = InferSelectModel<
  typeof employeeDepartmentsTable
>;
export type RoleDepartmentFromDb = InferSelectModel<
  typeof roleDepartmentsTable
>;
export type UserRoleFromDb = InferSelectModel<typeof userRolesTable>;
export type EmployeeFromDb = InferSelectModel<typeof employeesTable>;
export type AppUserRefreshTokenFromDb = InferSelectModel<
  typeof appUserRefreshTokensTable
>;
export type CompanyInfoFromDb = InferSelectModel<typeof companyInfoTable>;

// Material
export * from "./material";

export * from "./process-work-type";

// Project Assembly
export * from "./project-assembly";

// Project Assembly Location
export * from "./project-assembly-location";

// Project Assembly Sub-Location
export * from "./project-assembly-sub-location";

// Process Work Detail
export * from "./process-work-detail";

// Project Statistics
export * from "./project-statistics";
export * from "./project-sub-statistics";
export * from "./project-sub-statistics-completed-assembly";

// Project Assembly Process
export * from "./project-assembly-process";

// Project Part
export * from "./project-part";

export * from "./employees";

export * from "./enum";
