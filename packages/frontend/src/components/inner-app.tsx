import { RouterProvider } from "@tanstack/react-router";
import { useAuth } from "../auth/use-auth";
import { router } from "@/router";
import { queryClient } from "@/query-client";

export function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}
