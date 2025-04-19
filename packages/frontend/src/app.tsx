import { RouterProvider } from "@tanstack/react-router";

import { queryClient, router } from "@/trpc.js";
import { useAuth } from "@/auth/use-auth";

export function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}
