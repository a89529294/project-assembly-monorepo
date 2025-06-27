import { router } from "../core.js";
import { createPurchaseProcedure } from "./procedures/create-purchase-procedure";
import {
  readOrdersProcedure,
  readPurchasesProcedure,
} from "./procedures/read-materials.js";
import { updatePurchaseProcedure } from "./procedures/update-purchase-procedure";
import { createPurchasesUsingXLSXProcedure } from "./procedures/create-purchases-using-xlsx.js";

export const warehouseRouter = router({
  createPurchase: createPurchaseProcedure,
  readPurchases: readPurchasesProcedure,
  readOrders: readOrdersProcedure,
  updatePurchase: updatePurchaseProcedure,
  createPurchasesUsingXLSX: createPurchasesUsingXLSXProcedure,
});
