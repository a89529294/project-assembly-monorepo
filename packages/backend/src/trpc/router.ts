import { authRouter } from "./auth/router.js";
import { basicInfoRouter } from "./basic-info/router.js";
import { router } from "./core.js";
import { personnelPermissionRouter } from "./personnel-permission/router.js";

export const appRouter = router({
  auth: authRouter,
  personnelPermission: personnelPermissionRouter,
  basicInfo: basicInfoRouter,
  // auth: router({
  //   login: loginProcedure,
  //   logout: logoutProcedure,
  //   me: protectedProcedure("").mutation(async ({ ctx }) => {
  //     const user = ctx.user;
  //     const roles = await getUserRoles(user.id);
  //     const isAdminUser = await isAdmin(user.id);

  //     return {
  //       account: user.account,
  //       id: user.id,
  //       name: user.name,
  //       isAdmin: isAdminUser,
  //       roles: roles,
  //     };
  //   }),
  // }),
});

export type AppRouter = typeof appRouter;

export type TrpcTypes = {
  Router: AppRouter;
  User: AppRouter["auth"]["login"]["_def"]["$types"]["output"]["user"];
  AppUser: AppRouter["personnelPermission"]["getAppUserByPermission"]["_def"]["$types"]["output"][number];
  Employee: AppRouter["basicInfo"]["getEmployees"]["_def"]["$types"]["output"][number];
};
