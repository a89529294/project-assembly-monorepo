import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { AuthContext } from "../auth/";

type MyRouterContext = {
  queryClient: QueryClient;
  auth: AuthContext;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context, location }) => {
    const { auth } = context;
    const { isAuthenticated } = auth;
    console.log(auth);

    // If the user is not authenticated and is trying to access a protected route,
    // redirect them to the /login page.
    if (!isAuthenticated && location.pathname !== "/login") {
      throw redirect({
        to: "/login",
        search: {
          // Use the original location to redirect back after login
          redirect: location.href,
        },
      });
    }

    // If the user is authenticated and is trying to access the login page,
    // redirect them to the dashboard.
    if (isAuthenticated && location.pathname === "/login") {
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});
