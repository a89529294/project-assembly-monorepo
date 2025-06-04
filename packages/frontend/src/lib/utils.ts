import { clsx, type ClassValue } from "clsx";
import { User } from "../../../backend/src/trpc/router";
import { roleNameEnum } from "../../../backend/src/db/schema";
import { baseURL, generateHeaders } from "../constants";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "button-sm-active",
        "header-xl",
        "title-md",
        "button-sm",
        "button-md",
        "title-mn",
        "body-lg",
      ],
      font: ["inter"],
      color: [
        "surface-0",
        "surface-100",
        "surface-200",
        "surface-300",
        "surface-400",
        "secondary-600",
        "secondary-700",
        "secondary-800",
        "secondary-900",
        "primary-50",
        "primary-100",
        "primary-200",
        "primary-300",
        "danger-200",
        "danger-300",
      ],
    },
  },
});

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

export const uploadToS3 = (
  file: File,
  uploadUrl: string,
  onProgress: (progrss: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", "text/csv");
    xhr.timeout = 300000; // 5 minutes

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const eTag = xhr.getResponseHeader("ETag");
        resolve(eTag ? eTag.replace(/^"|"$/g, "") : "");
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = xhr.ontimeout = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
};
