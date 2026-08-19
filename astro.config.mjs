import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://cattyverse.com",
	base: "/schrodinger-likes-cats",
	outDir: "./dist/schrodinger-likes-cats",
	publicDir: "src/public",
	integrations: [mdx(), svelte()],
});
