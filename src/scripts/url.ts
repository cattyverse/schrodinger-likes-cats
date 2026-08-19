const base = import.meta.env.BASE_URL.replace(/\/$/, "");

const imageHost = "https://assets.cattyverse.com/schrodinger-likes-cats";

export function imageUrl(slug: string, name: string): string {
	if (slug === "site" || import.meta.env.DEV) {
		return `${base}/images/${slug}/${name}`;
	}
	return `${imageHost}/${slug}/${name}`;
}

export function styleUrl(name: string): string {
	return `${base}/styles/${name}`;
}
