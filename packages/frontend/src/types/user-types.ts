/**
 * Types for user-related data and operations
 */

export type UserOrderByField = "id" | "name" | "account" | "employeeId" | "passwordHash";
export type OrderDirection = "ASC" | "DESC";

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
