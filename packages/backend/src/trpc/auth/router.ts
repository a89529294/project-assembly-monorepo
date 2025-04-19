import { loginProcedure, logoutProcedure, meProcedure } from "./procedures.js";
import { router } from "../core.js";

export const authRouter = router({
  login: loginProcedure,
  logout: logoutProcedure,
  me: meProcedure,
});
