import { router } from "../core.js";
import { readPurchasesProcedure } from "./procedures/read-purchases.js";

export const warehouseRouter = router({
  readPurchases: readPurchasesProcedure,
});
