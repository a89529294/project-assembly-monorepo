import { router } from "../core.js";
import {
  readProjectAssembliesProcedure,
  readSimpleProjectsProcedure,
} from "./project-procedures.js";

export const productionRouter = router({
  readSimpleProjects: readSimpleProjectsProcedure,
  readProjectAssemblies: readProjectAssembliesProcedure,
});
