import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import { baseSoftDeleteSchema } from "./common";
import { genderEnum } from "./enum";

export const employeeColumns = {
  ...baseSoftDeleteSchema,
  idNumber: varchar("id_number", { length: 20 }).notNull().unique(),
  chName: varchar("ch_name", { length: 100 }).notNull(),
  phone: varchar({ length: 30 }).notNull(),
  gender: genderEnum().notNull(),
  enName: varchar("en_name", { length: 100 }),
  birthday: timestamp("birthday", { withTimezone: true, mode: "date" }),
  maritalStatus: varchar("maritalStatus", { length: 20 }),
  education: varchar({ length: 50 }),
  email: varchar({ length: 100 }),
  residenceCounty: varchar("residence_county", { length: 100 }),
  residenceDistrict: varchar("residence_district", { length: 100 }),
  residenceAddress: varchar("residence_address", { length: 255 }),
  mailingCounty: varchar("mailing_county", { length: 100 }),
  mailingDistrict: varchar("mailing_district", { length: 100 }),
  mailingAddress: varchar("mailing_address", { length: 255 }),
};

export const employeesTable = pgTable("employees", employeeColumns);
