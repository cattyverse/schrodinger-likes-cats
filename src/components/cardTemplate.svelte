<script lang="ts">
import ui from "../site/ja/ui.json";
import tagJa from "../tags/ja/tag.json";
import FramesTemplate from "./framesTemplate.svelte";

type Props = {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	frames?: number;
	interval?: number;
};

let { slug, title, description, tags, frames, interval }: Props = $props();

const words = tagJa as Record<string, { label: string }>;
const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const extraId = $derived(`extra-${slug}`);
const label = (id: string) => words[id]?.label ?? id;
</script>

<article class="card" data-card data-slug={slug}>
	<p class="card-lede">{description}</p>
	<div class="card-slot" data-slot>
		{#if frames && interval}
			<FramesTemplate {slug} {frames} {interval} {title} />
		{/if}
	</div>
	<ul class="card-tags">
		{#each tags as id (id)}
			<li>
				<a class="tag-chip" href="{base}/?tag={encodeURIComponent(id)}"
					>#{label(id)}</a
				>
			</li>
		{/each}
	</ul>
	<div
		class="card-extra"
		id={extraId}
		data-extra
		inert={true}
		aria-hidden="true"
	>
		<div class="card-extra-inner">
			<div class="card-play" data-play-slot></div>
			<div class="card-detail">
				<p class="card-detail-label">{ui.commentary}</p>
				<p class="card-detail-name">
					<a href="{base}/{slug}/">{title}</a>
				</p>
			</div>
		</div>
	</div>
	<button
		type="button"
		class="card-more"
		aria-expanded="false"
		aria-controls={extraId}
		data-more
	>
		<span class="card-more-rule" aria-hidden="true"></span>
		<span class="card-more-box">
			<span class="card-mark" aria-hidden="true">
				<svg viewBox="0 0 16 10" aria-hidden="true">
					<path
						d="M2 1 L8 9 L14 1"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					></path>
				</svg>
				<svg viewBox="0 0 16 10" aria-hidden="true">
					<path
						d="M2 1 L8 9 L14 1"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					></path>
				</svg>
			</span>
			<span class="card-more-open">{ui.more}</span>
			<span class="card-more-close">{ui.close}</span>
		</span>
		<span class="card-more-rule" aria-hidden="true"></span>
	</button>
</article>
