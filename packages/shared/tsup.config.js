import { defineConfig } from "tsup";

export default defineConfig(() => {
  return {
    format: ["esm", "cjs"],
    entryPoints: ["src/index.ts"],
    dts: {
      resolve: true,
      entry: "src/index.ts",
    },
    tsconfig: "./tsconfig.json",
  };
});
