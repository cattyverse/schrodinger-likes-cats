import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://cattyverse.github.io",
	base: "/schrodinger-likes-cats",
	integrations: [mdx(), svelte()],
});
