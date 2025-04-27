import { authRouter } from "./auth/router.js";
import { basicInfoRouter } from "./basic-info/router.js";
import { router } from "./core.js";
import { personnelPermissionRouter } from "./personnel-permission/router.js";

export const appRouter = router({
  auth: authRouter,
  personnelPermission: personnelPermissionRouter,
  basicInfo: basicInfoRouter,
});

export type AppRouter = typeof appRouter;
export type User =
  AppRouter["auth"]["login"]["_def"]["$types"]["output"]["user"];
export type AppUser =
  AppRouter["personnelPermission"]["getAppUserByPermission"]["_def"]["$types"]["output"][number];
export type Employee =
  AppRouter["basicInfo"]["getEmployees"]["_def"]["$types"]["output"][number];
