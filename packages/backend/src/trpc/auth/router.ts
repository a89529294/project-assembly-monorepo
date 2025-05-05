import { loginProcedure, logoutProcedure } from "./procedures.js";
import { router } from "../core.js";

export const authRouter = router({
  login: loginProcedure,
  logout: logoutProcedure,
});
