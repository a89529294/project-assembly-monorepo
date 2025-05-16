/**
 * Types for user-related data and operations
 */

import { OrderDirection } from "@myapp/shared";

export type UserOrderByField =
  | "id"
  | "name"
  | "account"
  | "employeeId"
  | "passwordHash";

export interface UserQueryParams {
  page: number;
  pageSize: number;
  orderBy: UserOrderByField;
  orderDirection: OrderDirection;
  searchTerm?: string;
}

export interface SortChangeResult<T extends string = UserOrderByField> {
  orderBy: T;
  orderDirection: OrderDirection;
  page: number;
}

export interface PageChangeResult {
  page: number;
}
