export type ContentsItem = {
	slug: string;
	published: string;
	tags: string[];
	title: string;
	description: string;
	frames?: number;
};

type Meta = {
	tags?: string[];
	image?: string;
	frames?: number;
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

const labIntroduction = import.meta.glob<Introduction>(
	"../lab/*/ja/introduction.json",
	{ eager: true, import: "default" },
);

export function slugOf(path: string, room: string): string {
	const parts = path.replaceAll("\\", "/").split("/");
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
			};
		})
		.sort((a, b) => b.published.localeCompare(a.published));
}

export function labCatalog(): ContentsItem[] {
	return Object.entries(labIntroduction)
		.map(([path, introduction]) => {
			const slug = slugOf(path, "lab");
			return {
				slug,
				published: introduction.published,
				title: introduction.title,
				description: introduction.description,
				tags: [],
			};
		})
		.sort((a, b) => b.published.localeCompare(a.published));
}
