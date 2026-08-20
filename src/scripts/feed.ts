import { mount, unmount } from "svelte";
import CardTemplate from "../components/cardTemplate.svelte";
import TagShelf from "../components/tagShelf.svelte";
import type { ContentsItem } from "./catalog";
import { itemInCatalog, shelfQuery, tagsOf } from "./tags";

export type FeedItem = ContentsItem;

type FeedInput = {
	items: FeedItem[];
	stack: HTMLElement;
	status: HTMLElement;
	sentinel: HTMLElement;
	footer: HTMLElement;
	shelf: HTMLElement;
};

const PAGE = 12;
const EXTRA_LIMIT = 20;
const WAIT_MS = 500;
const LEAD = "schrodingers-cat";

export function startFeed(input: FeedInput): void {
	new Feed(input).start();
}

class Feed {
	stack: HTMLElement;
	status: HTMLElement;
	sentinel: HTMLElement;
	footer: HTMLElement;
	shelf: HTMLElement;
	all: FeedItem[];
	items: FeedItem[] = [];
	observer: IntersectionObserver | undefined;
	cards: ReturnType<typeof mount>[] = [];
	shelfApp: ReturnType<typeof mount> | undefined;
	i = 0;
	extras = 0;
	busy = false;
	closed = false;
	gen = 0;

	constructor(input: FeedInput) {
		this.stack = input.stack;
		this.status = input.status;
		this.sentinel = input.sentinel;
		this.footer = input.footer;
		this.shelf = input.shelf;
		this.all = input.items;
	}

	start(): void {
		this.stack.addEventListener("click", (event) => {
			this.open(event);
		});
		document.addEventListener("click", (event) => {
			this.follow(event);
		});
		window.addEventListener("popstate", () => {
			void this.apply(true);
		});
		void this.apply(false);
	}

	/** 同じ一覧上の `?catalog=` / `?tag=` / `?order=published` は遷移せず入れ替える。 */
	follow(event: MouseEvent): void {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}
		const link = (event.target as HTMLElement | null)?.closest("a");
		if (!link?.href) {
			return;
		}
		let url: URL;
		try {
			url = new URL(link.href);
		} catch {
			return;
		}
		if (!this.sameList(url) || !this.swappable(url)) {
			return;
		}
		event.preventDefault();
		if (url.href === location.href) {
			return;
		}
		history.pushState({}, "", url);
		void this.apply(true);
	}

	sameList(url: URL): boolean {
		if (url.origin !== location.origin) {
			return false;
		}
		return (
			url.pathname.replace(/\/$/, "") === location.pathname.replace(/\/$/, "")
		);
	}

	swappable(url: URL): boolean {
		const query = url.searchParams;
		return (
			query.has("catalog") ||
			query.has("tag") ||
			query.get("order") === "published"
		);
	}

	async apply(fromClick: boolean): Promise<void> {
		this.gen += 1;
		const gen = this.gen;
		this.observer?.disconnect();
		this.observer = undefined;
		this.clear();
		this.i = 0;
		this.extras = 0;
		this.busy = false;
		this.closed = false;
		this.footer.hidden = true;
		this.items = this.order(this.all);
		this.paintShelf();
		this.syncNav();
		if (fromClick) {
			window.scrollTo(0, 0);
		}
		await this.fill(gen, fromClick ? 0 : WAIT_MS);
		if (gen === this.gen && !this.closed) {
			this.watch(gen);
		}
	}

	paintShelf(): void {
		const { catalog, tag } = shelfQuery(location.search);
		if (!catalog) {
			return;
		}
		this.shelfApp = mount(TagShelf, {
			target: this.shelf,
			props: { catalog, tag },
		});
	}

	syncNav(): void {
		const now = new URL(location.href);
		const catalog = now.searchParams.get("catalog");
		const order = now.searchParams.get("order");
		for (const link of document.querySelectorAll<HTMLAnchorElement>(
			".site-nav a",
		)) {
			const url = new URL(link.href);
			let on = false;
			if (url.searchParams.has("catalog")) {
				on = catalog === url.searchParams.get("catalog");
			} else if (url.searchParams.has("order")) {
				on = order === url.searchParams.get("order") && !catalog;
			}
			if (on) {
				link.setAttribute("aria-current", "page");
			} else {
				link.removeAttribute("aria-current");
			}
		}
		const brand = document.querySelector(".site-brand");
		if (brand) {
			if (now.searchParams.size === 0) {
				brand.setAttribute("aria-current", "page");
			} else {
				brand.removeAttribute("aria-current");
			}
		}
	}

	/** クエリなしは乱数＋先頭シュレ猫。`?catalog=` は配下。`?tag=` はそのタグ。`?order=published` は全件の新しい順。 */
	order(items: FeedItem[]): FeedItem[] {
		const query = shelfQuery(location.search);
		const catalog = query.catalog;
		if (catalog) {
			let list = items.filter((item) => itemInCatalog(item.tags, catalog));
			const tag = query.tag;
			if (tag && tagsOf(catalog).includes(tag)) {
				list = list.filter((item) => item.tags.includes(tag));
			}
			return list.sort((a, b) => b.published.localeCompare(a.published));
		}
		if (query.order === "published") {
			return items
				.slice()
				.sort((a, b) => b.published.localeCompare(a.published));
		}
		const lead = items.filter((item) => item.slug === LEAD);
		const rest = this.shuffle(items.filter((item) => item.slug !== LEAD));
		return [...lead, ...rest];
	}

	/** 初回。窓を埋めるまで足す。 */
	async fill(gen: number, wait: number): Promise<void> {
		if (this.items.length === 0) {
			this.end();
			return;
		}
		do {
			if (gen !== this.gen) {
				return;
			}
			const before = this.i;
			await this.add(false, gen, wait);
			if (this.i === before) {
				break;
			}
		} while (!this.closed && this.need() > 0);
	}

	/** 末尾が見えたとき。スクロールの手段は問わない。 */
	extra(gen: number): void {
		if (this.busy || this.closed || gen !== this.gen) {
			return;
		}
		void this.add(true, gen, WAIT_MS).then(() => {
			if (!this.closed && gen === this.gen && this.hit()) {
				this.extra(gen);
			}
		});
	}

	/** ローディングを出し、この回のカードを組み立ててから一気に足す。 */
	async add(countAsExtra: boolean, gen: number, wait: number): Promise<void> {
		if (this.busy || this.closed || gen !== this.gen) {
			return;
		}
		if (
			this.i >= this.items.length ||
			(countAsExtra && this.extras >= EXTRA_LIMIT)
		) {
			this.end();
			return;
		}
		if (countAsExtra) {
			this.extras += 1;
		}
		this.busy = true;
		this.spin(true);
		try {
			const slice = this.items.slice(this.i, this.i + this.take());
			if (wait > 0) {
				await new Promise<void>((resolve) => {
					setTimeout(resolve, wait);
				});
			}
			if (gen !== this.gen) {
				return;
			}
			for (const item of slice) {
				this.cards.push(
					mount(CardTemplate, {
						target: this.stack,
						props: {
							slug: item.slug,
							title: item.title,
							description: item.description,
							tags: item.tags,
							frames: item.frames,
							interval: item.interval,
						},
					}),
				);
			}
			this.i += slice.length;
		} finally {
			if (gen === this.gen) {
				this.busy = false;
				this.spin(false);
			}
		}
		if (gen !== this.gen) {
			return;
		}
		if (this.i >= this.items.length || this.extras >= EXTRA_LIMIT) {
			this.end();
		}
	}

	/** 窓を埋める行を数え、最低 12、足りなければ 12 の倍数。 */
	take(): number {
		const n = Math.max(PAGE, Math.ceil(this.need() / PAGE) * PAGE);
		return Math.min(n, this.items.length - this.i);
	}

	need(): number {
		const cards = this.stack.querySelectorAll<HTMLElement>("[data-card]");
		const last = cards[cards.length - 1];
		if (!last) {
			return PAGE;
		}
		const rem = Number.parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		);
		const row = last.getBoundingClientRect().height + 3.5 * rem;
		const leftover = window.innerHeight - last.getBoundingClientRect().bottom;
		if (leftover <= 0) {
			return 0;
		}
		return Math.ceil(leftover / row);
	}

	end(): void {
		this.closed = true;
		this.observer?.disconnect();
		this.spin(false);
		this.footer.hidden = false;
	}

	clear(): void {
		for (const card of this.cards) {
			unmount(card);
		}
		this.cards = [];
		if (this.shelfApp) {
			unmount(this.shelfApp);
			this.shelfApp = undefined;
		}
		this.stack.replaceChildren();
		this.shelf.replaceChildren();
	}

	open(event: Event): void {
		const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
			"[data-more]",
		);
		if (!button) {
			return;
		}
		const card = button.closest<HTMLElement>("[data-card]");
		const extra = card?.querySelector<HTMLElement>("[data-extra]");
		if (!card || !extra) {
			return;
		}
		const next = button.getAttribute("aria-expanded") !== "true";
		button.setAttribute("aria-expanded", String(next));
		card.classList.toggle("is-open", next);
		extra.inert = !next;
		extra.setAttribute("aria-hidden", String(!next));
	}

	watch(gen: number): void {
		this.observer = new IntersectionObserver((entries) => {
			if (gen !== this.gen) {
				return;
			}
			if (entries.some((entry) => entry.isIntersecting)) {
				this.extra(gen);
			}
		});
		this.observer.observe(this.sentinel);
		if (this.hit()) {
			this.extra(gen);
		}
	}

	hit(): boolean {
		const box = this.sentinel.getBoundingClientRect();
		return box.top < window.innerHeight && box.bottom > 0;
	}

	spin(on: boolean): void {
		this.status.hidden = !on;
		this.stack.toggleAttribute("aria-busy", on);
	}

	shuffle<T>(items: T[]): T[] {
		const out = items.slice();
		for (let i = out.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
			const a = out[i];
			const b = out[j];
			if (a === undefined || b === undefined) {
				continue;
			}
			out[i] = b;
			out[j] = a;
		}
		return out;
	}
}
