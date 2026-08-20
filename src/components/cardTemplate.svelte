<script lang="ts">
import { labelOf, shelfQuery, tagHref } from "../scripts/tags";
import ui from "../site/ja/ui.json";
import FramesTemplate from "./framesTemplate.svelte";
import PlayTemplate from "./playTemplate.svelte";

type Props = {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	frames?: number;
};

let { slug, title, description, tags, frames }: Props = $props();

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const extraId = $derived(`extra-${slug}`);
const currentTag = shelfQuery(location.search).tag;
const html = $derived(bodyOf(slug));

function bodyOf(id: string): string {
	const node = document.querySelector(`[data-card-body="${CSS.escape(id)}"]`);
	if (node instanceof HTMLTemplateElement) {
		return node.innerHTML;
	}
	return node?.innerHTML ?? "";
}
</script>

<article class="card" data-card data-slug={slug}>
	<p class="card-lede">{description}</p>
	<div class="card-slot" class:lab-body={!frames} data-slot>
		{#if frames}
			<FramesTemplate {slug} {frames} {title} />
		{:else}
			{@html html}
		{/if}
	</div>
	{#if tags.length}
		<ul class="card-tags">
			{#each tags as id (id)}
				<li>
					<a
						class="tag-chip"
						href={tagHref(base, id)}
						aria-current={id === currentTag ? "true" : undefined}
						>#{labelOf(id)}</a
					>
				</li>
			{/each}
		</ul>
	{/if}
	{#if frames}
		<div
			class="card-extra"
			id={extraId}
			data-extra
			inert={true}
			aria-hidden="true"
		>
			<div class="card-extra-inner">
				<PlayTemplate {slug} />
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
	{/if}
</article>
