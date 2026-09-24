import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

function cloudflareStubPlugin() {
  return {
    name: "vite-plugin-cloudflare-stub",
    enforce: "pre" as const,
    resolveId(id: string) {
      if (id.startsWith("cloudflare:")) {
        return "\0" + id;
      }
    },
    load(id: string) {
      if (id.startsWith("\0cloudflare:")) {
        return `
          export class WorkerEntrypoint {}
          export class DurableObject {}
          export class WorkflowEntrypoint {}
          export class Fetcher {}
          export const env = {};
          export const assets = {};
          export const kv = {};
          export const sockets = {};
          export default {};
        `;
      }
    },
  };
}

export default defineConfig({
  plugins: [
    cloudflareStubPlugin(),
    vinext({
      images: { optimizer: imagesOptimizer() },
      prerender: { routes: "*" },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
