import tagsFile from "../tags/ja/tags.json";

type Words = {
	label: string;
	description?: string;
};

type CatalogNode = Words & {
	tags: Record<string, Words>;
};

const rooms = tagsFile as Record<string, CatalogNode>;

export const catalogs = Object.keys(rooms);

const parentOf = new Map<string, string>();
const tagWords = new Map<string, Words>();

for (const [catalog, room] of Object.entries(rooms)) {
	for (const [tag, words] of Object.entries(room.tags)) {
		parentOf.set(tag, catalog);
		tagWords.set(tag, words);
	}
}

export function labelOf(id: string): string {
	return tagWords.get(id)?.label ?? id;
}

export function catalogLabelOf(id: string): string {
	return rooms[id]?.label ?? id;
}

export function catalogDescriptionOf(id: string): string | undefined {
	const text = rooms[id]?.description;
	return text ? text : undefined;
}

export function catalogOf(tag: string): string | undefined {
	return parentOf.get(tag);
}

export function tagsOf(catalog: string): string[] {
	return Object.keys(rooms[catalog]?.tags ?? {});
}

export function hasCatalog(id: string): boolean {
	return id in rooms;
}

export function itemInCatalog(tags: string[], catalog: string): boolean {
	const room = tagsOf(catalog);
	return tags.some((tag) => room.includes(tag));
}

export function shelfHref(base: string, catalog: string, tag?: string): string {
	const query = [`catalog=${encodeURIComponent(catalog)}`];
	if (tag) {
		query.push(`tag=${encodeURIComponent(tag)}`);
	}
	return `${base}/?${query.join("&")}`;
}

export function tagHref(base: string, tag: string): string {
	const catalog = catalogOf(tag);
	if (!catalog) {
		return `${base}/?tag=${encodeURIComponent(tag)}`;
	}
	return shelfHref(base, catalog, tag);
}

export type ShelfQuery = {
	catalog?: string;
	tag?: string;
	order?: string;
};

export function shelfQuery(search: string): ShelfQuery {
	const query = new URLSearchParams(search);
	const tag = query.get("tag") ?? undefined;
	let catalog = query.get("catalog") ?? undefined;
	if (!catalog && tag) {
		catalog = catalogOf(tag);
	}
	if (catalog && !hasCatalog(catalog)) {
		catalog = undefined;
	}
	const known = catalog ? tagsOf(catalog) : [];
	return {
		catalog,
		tag: catalog && tag && known.includes(tag) ? tag : undefined,
		order: query.get("order") ?? undefined,
	};
}
