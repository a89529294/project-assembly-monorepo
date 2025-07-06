import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../auth/use-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TRPCClientError } from "@trpc/client";
import { useEffect } from "react";

import { CustomBreadCrumb } from "@/components/navbar/custom-breadcrumb";
import { DialogUpdatePassword } from "@/components/dialogs/update-password";

export const Route = createFileRoute("/_dashboard")({
  component: RouteComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const { logout, user } = useAuth();

  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="grow font-inter">
        <div className="flex flex-col h-screen">
          {/* Navbar */}
          <nav className="bg-secondary-900 h-20 text-white pl-6 pr-8 flex items-center justify-between">
            <CustomBreadCrumb />

            {/* name, change password, logout */}
            <div>
              <div className="flex items-center gap-7">
                <div className="flex items-center gap-3 text-title-md">
                  <img src="/avatar.png" />
                  {user.name}
                </div>
                <div className="flex gap-2">
                  <DialogUpdatePassword />
                  <button
                    onClick={async () => {
                      await logout();
                      navigate({ to: "/login" });
                    }}
                    className="flex items-center gap-2 py-3 px-4 rounded-sm text-button-md border border-primary-300 cursor-pointer"
                  >
                    <img src="/logout.png" />
                    登出
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <div className="relative flex-grow flex flex-col">
            <div className="absolute inset-0">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!error) return;

    const redirect = location.pathname + location.search;

    if (error instanceof TRPCClientError) {
      if (error.message === "UNAUTHORIZED") {
        clearAuth();
        navigate({ to: "/login", search: { redirect } });
      } else if (error.message === "FORBIDDEN") {
        navigate({ to: "/" });
      }
    }
    console.log(error);
  }, [error, clearAuth, navigate]);

  return "error";
}
