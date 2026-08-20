<script lang="ts">
import {
	catalogDescriptionOf,
	catalogLabelOf,
	labelOf,
	shelfHref,
	tagsOf,
} from "../scripts/tags";

type Props = {
	catalog: string;
	tag?: string;
};

let { catalog, tag }: Props = $props();

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const chips = $derived(tagsOf(catalog));
const description = $derived(catalogDescriptionOf(catalog));
</script>

<nav class="tag-shelf" aria-label="タグ">
	<h1 class="tag-shelf-name">{catalogLabelOf(catalog)}</h1>
	{#if description}
		<p class="tag-shelf-desc">{description}</p>
	{/if}
	<ul class="tag-row">
		{#each chips as id (id)}
			<li>
				<a
					class="tag-chip"
					href={shelfHref(base, catalog, id === tag ? undefined : id)}
					aria-current={id === tag ? "true" : undefined}
					>#{labelOf(id)}</a
				>
			</li>
		{/each}
	</ul>
</nav>
