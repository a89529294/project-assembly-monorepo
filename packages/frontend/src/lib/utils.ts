import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "../../../backend/src/trpc/router";
import { roleNameEnum } from "../../../backend/src/db/schema";
import { baseURL, generateHeaders } from "../constants";

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

export async function privateFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${baseURL}${path}`;

  const headers = {
    ...generateHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Optionally try to parse error message from response body
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch {
      // Response is not JSON or has no message
    }
    throw new Error(errorMsg);
  }

  return response;
}
