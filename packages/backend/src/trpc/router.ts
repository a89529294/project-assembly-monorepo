import type { inferRouterOutputs } from "@trpc/server";
import { authRouter } from "./auth/router.js";
import { basicInfoRouter } from "./basic-info/router.js";
import { router } from "./core.js";
import { personnelPermissionRouter } from "./personnel-permission/router.js";
import { productionRouter } from "./production/router.js";
import { warehouseRouter } from "./warehouse/router.js";

type RouterOutput = inferRouterOutputs<AppRouter>;

export const appRouter = router({
  auth: authRouter,
  basicInfo: basicInfoRouter,
  personnelPermission: personnelPermissionRouter,
  production: productionRouter,
  warehouse: warehouseRouter,
});

export type AppRouter = typeof appRouter;
// TODO maybe move all following types to shared
export type User =
  AppRouter["auth"]["login"]["_def"]["$types"]["output"]["user"];
export type AppUser =
  AppRouter["personnelPermission"]["readAppUserByPermission"]["_def"]["$types"]["output"][number];
export type SimpleProject =
  RouterOutput["production"]["readSimpleProjects"][number];
