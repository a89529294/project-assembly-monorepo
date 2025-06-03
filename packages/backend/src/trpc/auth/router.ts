import {
  loginProcedure,
  logoutProcedure,
  updatePasswordProcedure,
} from "./procedures.js";
import { router } from "../core.js";

export const authRouter = router({
  login: loginProcedure,
  logout: logoutProcedure,
  updatePassword: updatePasswordProcedure,
});
