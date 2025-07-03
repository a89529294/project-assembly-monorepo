import { router } from "../core.js";
import { createPurchaseProcedure } from "./procedures/create-purchase-procedure";
import {
  readOrdersProcedure,
  readPurchasesProcedure,
} from "./procedures/read-materials.js";
import { updatePurchaseProcedure } from "./procedures/update-purchase-procedure";
import { confirmMaterialArrivalProcedure } from "./procedures/confirm-material-arrival-procedure";
import { createPurchasesUsingXLSXProcedure } from "./procedures/create-purchases-using-xlsx.js";
import { cutMaterialProcedure } from "./procedures/cut-material-procedure.js";
import { deleteMaterialProcedure } from "./procedures/delete-material-procedure.js";

export const warehouseRouter = router({
  createPurchase: createPurchaseProcedure,
  readPurchases: readPurchasesProcedure,
  readOrders: readOrdersProcedure,
  updatePurchase: updatePurchaseProcedure,
  createPurchasesUsingXLSX: createPurchasesUsingXLSXProcedure,
  confirmMaterialArrival: confirmMaterialArrivalProcedure,
  cutMaterial: cutMaterialProcedure,
  deleteMaterial: deleteMaterialProcedure,
});
