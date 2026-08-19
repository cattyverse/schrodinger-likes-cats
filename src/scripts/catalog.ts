export type ContentsItem = {
	slug: string;
	published: string;
	tags: string[];
};

type Meta = {
	tags?: string[];
	image?: string;
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

function tagsOf(slug: string): string[] {
	for (const [path, meta] of Object.entries(contentsMeta)) {
		if (slugOf(path, "contents") === slug) {
			return meta.tags ?? [];
		}
	}
	return [];
}

export function contentsCatalog(): ContentsItem[] {
	return Object.entries(contentsIntroduction)
		.map(([path, introduction]) => {
			const slug = slugOf(path, "contents");
			return {
				slug,
				published: introduction.published,
				tags: tagsOf(slug),
			};
		})
		.sort((a, b) => b.published.localeCompare(a.published));
}
