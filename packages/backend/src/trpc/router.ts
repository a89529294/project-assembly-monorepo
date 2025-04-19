import { initTRPC, TRPCError } from "@trpc/server";
import { getCurrentSession } from "../db/session-api.js";
import { getUserRoles, hasPermission, isAdmin } from "../helpers/auth.js";
import type { Context } from "hono";
// import {
//   loginProcedure,
//   logoutProcedure,
//   meProcedure,
// } from "trpc/auth/procedures";
// import { loginProcedure, logoutProcedure } from "./auth/procedures.js";
import { authRouter } from "./auth/router.js";
// import { t } from "trpc/core";
import { personnelPermissionRouter } from "./personnel-permission/router.js";
import { router } from "./core.js";

export const appRouter = router({
  auth: authRouter,
  personnelPermission: personnelPermissionRouter,
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
};
