import { App } from "@/app.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import { queryClient, router } from "@/constants";
import { AuthProvider } from "@/auth/auth-provider.tsx";

import { queryClient } from "@/query-client";
import { router } from "@/router";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
