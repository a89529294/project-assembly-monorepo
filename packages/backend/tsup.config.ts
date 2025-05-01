import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    format: ["esm"],
    entryPoints: ["src/index.ts"],
    onSuccess: options.watch ? "node dist/index.js" : undefined,
    minify: !options.watch,
  };
});
