export type ContentsItem = {
	slug: string;
	published: string;
	tags: string[];
	title: string;
	description: string;
	frames?: number;
	interval?: number;
};

type Meta = {
	tags?: string[];
	image?: string;
	frames?: number;
	interval?: number;
};

type Introduction = {
	title: string;
	description: string;
	published: string;
};

const contentsMeta = import.meta.glob<Meta>("../contents/*/meta.json", {
	eager: true,
	import: "default",
});

const contentsIntroduction = import.meta.glob<Introduction>(
	"../contents/*/ja/introduction.json",
	{ eager: true, import: "default" },
);

function slugOf(path: string, room: string): string {
	const parts = path.split("/");
	return parts[parts.indexOf(room) + 1] ?? "";
}

function metaOf(slug: string): Meta {
	for (const [path, meta] of Object.entries(contentsMeta)) {
		if (slugOf(path, "contents") === slug) {
			return meta;
		}
	}
	return {};
}

export function contentsCatalog(): ContentsItem[] {
	return Object.entries(contentsIntroduction)
		.map(([path, introduction]) => {
			const slug = slugOf(path, "contents");
			const meta = metaOf(slug);
			return {
				slug,
				published: introduction.published,
				title: introduction.title,
				description: introduction.description,
				tags: meta.tags ?? [],
				frames: meta.frames,
				interval: meta.interval,
			};
		})
		.sort((a, b) => b.published.localeCompare(a.published));
}
