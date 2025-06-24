import { router } from "../core.js";
import { createPurchaseProcedure } from "./procedures/create-purchase-procedure";
import { readPurchasesProcedure } from "./procedures/read-purchases";
import { updatePurchaseProcedure } from "./procedures/update-purchase-procedure";

export const warehouseRouter = router({
  createPurchase: createPurchaseProcedure,
  readPurchases: readPurchasesProcedure,
  updatePurchase: updatePurchaseProcedure,
});
