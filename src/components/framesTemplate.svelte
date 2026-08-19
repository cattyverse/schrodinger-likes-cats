<script lang="ts">
import { onMount } from "svelte";
import { imageUrl } from "../scripts/url";

const PUSH_MS = 300;
const injected = new Set<string>();

type Props = {
	slug: string;
	frames: number;
	interval: number;
	title: string;
};

let { slug, frames, interval, title }: Props = $props();

function pct(cycle: number, ms: number): string {
	return `${((ms / cycle) * 100).toFixed(4)}%`;
}

function keyframes(i: number, cycle: number): string {
	const visibleStart = i * (interval + PUSH_MS);
	const enterStart = visibleStart - PUSH_MS;
	const exitStart = visibleStart + interval;
	const name = `frames-${slug}-${i + 1}`;
	const p = (ms: number) => pct(cycle, ms);

	if (i === 0) {
		return `@keyframes ${name} {
			0% { transform: translateY(0); }
			${p(exitStart)} { transform: translateY(0); animation-timing-function: ease-out; }
			${p(exitStart + PUSH_MS)} { transform: translateY(-100%); }
			${p(cycle - PUSH_MS)} { transform: translateY(-100%); }
			${p(cycle - PUSH_MS + 1)} { transform: translateY(100%); animation-timing-function: ease-out; }
			100% { transform: translateY(0); }
		}`;
	}

	return `@keyframes ${name} {
		0% { transform: translateY(100%); }
		${p(enterStart)} { transform: translateY(100%); animation-timing-function: ease-out; }
		${p(visibleStart)} { transform: translateY(0); }
		${p(exitStart)} { transform: translateY(0); animation-timing-function: ease-out; }
		${p(exitStart + PUSH_MS)} { transform: translateY(-100%); }
		100% { transform: translateY(-100%); }
	}`;
}

function ensureCss(): void {
	if (injected.has(slug)) {
		return;
	}
	injected.add(slug);
	const count = frames + 1;
	const cycle = count * (interval + PUSH_MS);
	const css = Array.from({ length: count }, (_, i) => {
		const name = `frames-${slug}-${i + 1}`;
		return `${keyframes(i, cycle)}
.frames--${slug} > .frames-item:nth-child(${i + 1}) {
	animation: ${name} ${cycle}ms infinite;
}`;
	}).join("\n");
	let el = document.getElementById("frames-anim");
	if (!el) {
		el = document.createElement("style");
		el.id = "frames-anim";
		document.head.append(el);
	}
	el.append(document.createTextNode(css));
}

function missing(event: Event): void {
	const img = event.currentTarget;
	if (!(img instanceof HTMLImageElement) || img.dataset.fallback) {
		return;
	}
	img.dataset.fallback = "1";
	img.src = imageUrl("site", "missing.svg");
}

const srcs = $derived(
	Array.from({ length: frames }, (_, i) =>
		imageUrl(slug, `frames/frame${i + 1}.svg`),
	),
);

onMount(ensureCss);
</script>

<div class="frames frames--{slug}">
	<div class="frames-item">
		<h2 class="exhibit-title">{title}</h2>
	</div>
	{#each srcs as src (src)}
		<div class="frames-item">
			<img
				{src}
				width="480"
				height="360"
				alt=""
				loading="lazy"
				onerror={missing}
			>
		</div>
	{/each}
</div>
