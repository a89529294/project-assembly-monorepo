import { RouterProvider } from "@tanstack/react-router";

import { router } from "./router";
import { useAuth } from "@/auth/use-auth";
import { queryClient } from "@/query-client";

export function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}
