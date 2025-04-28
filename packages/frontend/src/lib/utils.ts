import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "../../../backend/src/trpc/router";
import { roleNameEnum } from "../../../backend/src/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// only need 1 of requiredRole
export function isAllowed(
  requiredRole: (typeof roleNameEnum)["enumValues"][number][],

  userRoles: User["roles"]
) {
  return !!requiredRole.find((rr) => userRoles.map((v) => v.name).includes(rr));
}
