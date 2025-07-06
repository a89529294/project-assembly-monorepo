import {
  loginProcedure,
  logoutProcedure,
  updatePasswordProcedure,
  validateSessionProcedure,
} from "./procedures.js";
import { router } from "../core.js";

export const authRouter = router({
  validateSession: validateSessionProcedure,
  login: loginProcedure,
  logout: logoutProcedure,
  updatePassword: updatePasswordProcedure,
});
