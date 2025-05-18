import { useDeferredValue } from "react";
import { AppUserPermission } from "@myapp/shared";

export interface DeferredAppPermissionControlsParams {
  searchTerm: string;
  permission: AppUserPermission;
}

export interface DeferredAppPermissionControlsReturn {
  deferredValues: {
    searchTerm: string;
    permission: AppUserPermission;
  };
  isUpdating: boolean;
}

/**
 * A custom hook for handling permission-based controls with deferred values
 * @param params - Parameters including search term and permission
 * @returns Deferred values and loading state
 */
export function useDeferredAppPermissionControls({
  searchTerm,
  permission,
}: DeferredAppPermissionControlsParams): DeferredAppPermissionControlsReturn {
  // Create deferred values for search term and permission
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredPermission = useDeferredValue(permission);

  // Determine if we're in a loading state based on deferred values
  const isUpdating = searchTerm !== deferredSearchTerm || permission !== deferredPermission;

  return {
    deferredValues: {
      searchTerm: deferredSearchTerm,
      permission: deferredPermission,
    },
    isUpdating,
  };
}
