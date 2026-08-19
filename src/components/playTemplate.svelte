<script module lang="ts">
const htmls = new Map<string, Promise<string>>();
const loaders = import.meta.glob<{
	mount: (root: HTMLElement) => () => void;
}>("../contents/*/play.ts");
const sheets = import.meta.glob("../contents/*/play.css");

function posix(path: string): string {
	return path.replaceAll("\\", "/");
}

function htmlOf(id: string, base: string): Promise<string> {
	let pending = htmls.get(id);
	if (!pending) {
		pending = fetch(`${base}/partial/${id}/play/`).then((response) =>
			response.text(),
		);
		htmls.set(id, pending);
	}
	return pending;
}

function sheetOf(id: string): (() => Promise<unknown>) | undefined {
	const suffix = `/contents/${id}/play.css`;
	const path = Object.keys(sheets).find((key) => posix(key).endsWith(suffix));
	return path ? sheets[path] : undefined;
}

function loadOf(
	id: string,
): (() => Promise<{ mount: (root: HTMLElement) => () => void }>) | undefined {
	const suffix = `/contents/${id}/play.ts`;
	const path = Object.keys(loaders).find((key) => posix(key).endsWith(suffix));
	return path ? loaders[path] : undefined;
}
</script>

<script lang="ts">
import { onMount } from "svelte";

type Props = {
	slug: string;
	embedded?: boolean;
};

let { slug, embedded = false }: Props = $props();

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
let host: HTMLElement | undefined = $state();

onMount(() => {
	if (!host) {
		return;
	}
	const slot = embedded ? host.closest<HTMLElement>("[data-play-root]") : host;
	if (!slot) {
		return;
	}
	const target: HTMLElement = slot;
	let stop = () => {};
	let cancelled = false;
	let observer: MutationObserver | undefined;
	const extra = target.closest<HTMLElement>("[data-extra]");

	async function run(): Promise<void> {
		await sheetOf(slug)?.();
		const incoming = loadOf(slug)?.();
		if (!embedded) {
			const html = await htmlOf(slug, base);
			if (cancelled) {
				return;
			}
			target.innerHTML = html;
		}
		const root = target.querySelector<HTMLElement>("[data-play]") ?? target;
		if (!incoming) {
			return;
		}
		const { mount } = await incoming;
		if (cancelled) {
			return;
		}
		stop = mount(root);
	}

	if (embedded || !extra?.inert) {
		void run();
	} else {
		observer = new MutationObserver(() => {
			if (!extra.inert) {
				observer?.disconnect();
				observer = undefined;
				void run();
			}
		});
		observer.observe(extra, { attributes: true, attributeFilter: ["inert"] });
	}

	return () => {
		cancelled = true;
		observer?.disconnect();
		stop();
	};
});
</script>

{#if embedded}
	<span class="play-bind" bind:this={host} hidden></span>
{:else}
	<div class="card-play" bind:this={host}></div>
{/if}
