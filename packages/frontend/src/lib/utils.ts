import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TrpcTypes } from "../../../backend/src/trpc/router";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// only need 1 of requiredRole
export function isAllowed(
  requiredRole: string[],
  userRoles: TrpcTypes["User"]["roles"]
) {
  return !!requiredRole.find((rr) => userRoles.map((v) => v.name).includes(rr));
}
