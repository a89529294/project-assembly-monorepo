import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useAuth } from "../../auth/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TRPCClientError } from "@trpc/client";
import { useEffect } from "react";

export const Route = createFileRoute("/_dashboard")({
  async beforeLoad({ context, location }) {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent3,
  errorComponent: ErrorComponent,
});

function RouteComponent3() {
  const router = useRouter();
  const navigate = Route.useNavigate();

  const { logout, user } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar user={user!} />
      <main className="grow">
        <div className="flex flex-col h-screen">
          {/* Navbar */}
          <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-white cursor-pointer" />
                <Link to="/" className="font-bold text-xl">
                  Company Logo
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <span>user:{user?.name || "guest"}</span>
                <button
                  onClick={async () => {
                    await logout(async () => {
                      await router.invalidate();

                      navigate({ to: "/login" });
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <div className="container relative mx-auto flex-grow flex flex-col">
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
        console.log("wtd");
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
