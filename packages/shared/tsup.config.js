import { defineConfig } from "tsup";

export default defineConfig(() => {
  return {
    format: ["esm", "cjs"],
    entryPoints: ["src/index.ts"],
    dts:
      process.env.NODE_ENV === "prod"
        ? false
        : {
            resolve: true,
            entry: "src/index.ts",
          },
    tsconfig: "./tsconfig.json",
  };
});
