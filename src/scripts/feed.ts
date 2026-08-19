export type FeedItem = {
	slug: string;
	published: string;
	tags: string[];
};

type FeedInput = {
	base: string;
	items: FeedItem[];
	stack: HTMLElement;
	status: HTMLElement;
	sentinel: HTMLElement;
	footer: HTMLElement;
};

const PAGE = 12;
const EXTRA_LIMIT = 20;
const WAIT_MS = 500;
const LEAD = "schrodinger-cat";

export function startFeed(input: FeedInput): void {
	new Feed(input).start();
}

class Feed {
	base: string;
	stack: HTMLElement;
	status: HTMLElement;
	sentinel: HTMLElement;
	footer: HTMLElement;
	items: FeedItem[];
	cache = new Map<string, Promise<string>>();
	observer: IntersectionObserver | undefined;
	i = 0;
	extras = 0;
	busy = false;
	closed = false;

	constructor(input: FeedInput) {
		this.base = input.base;
		this.stack = input.stack;
		this.status = input.status;
		this.sentinel = input.sentinel;
		this.footer = input.footer;
		this.items = this.order(input.items);
	}

	start(): void {
		this.stack.addEventListener("click", (event) => this.open(event));
		void this.fill().then(() => {
			if (!this.closed) {
				this.watch();
			}
		});
	}

	/** クエリなしは乱数＋先頭シュレ猫。`?tag=` はそのタグが付いた展示の新しい順。 */
	order(items: FeedItem[]): FeedItem[] {
		const tag = new URLSearchParams(location.search).get("tag");
		if (tag) {
			return items
				.filter((item) => item.tags.includes(tag))
				.sort((a, b) => b.published.localeCompare(a.published));
		}
		const lead = items.filter((item) => item.slug === LEAD);
		const rest = this.shuffle(items.filter((item) => item.slug !== LEAD));
		return [...lead, ...rest];
	}

	/** 初回。窓を埋めるまで足す。 */
	async fill(): Promise<void> {
		if (this.items.length === 0) {
			this.end();
			return;
		}
		do {
			const before = this.i;
			await this.add(false);
			if (this.i === before) {
				break;
			}
		} while (!this.closed && this.need() > 0);
	}

	/** 末尾が見えたとき。スクロールの手段は問わない。 */
	extra(): void {
		if (this.busy || this.closed) {
			return;
		}
		void this.add(true).then(() => {
			if (!this.closed && this.hit()) {
				this.extra();
			}
		});
	}

	/** ローディングを出し、この回の HTML を全部取ってから一気に足す。 */
	async add(countAsExtra: boolean): Promise<void> {
		if (this.busy || this.closed) {
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
			const [htmls] = await Promise.all([
				Promise.all(slice.map((item) => this.html(item.slug))),
				new Promise<void>((resolve) => {
					setTimeout(resolve, WAIT_MS);
				}),
			]);
			this.stack.insertAdjacentHTML("beforeend", htmls.join(""));
			this.i += slice.length;
		} finally {
			this.busy = false;
			this.spin(false);
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

	html(slug: string): Promise<string> {
		let pending = this.cache.get(slug);
		if (!pending) {
			pending = fetch(`${this.base}/partial/${slug}/card/`).then((response) =>
				response.text(),
			);
			this.cache.set(slug, pending);
		}
		return pending;
	}

	end(): void {
		this.closed = true;
		this.observer?.disconnect();
		this.spin(false);
		this.footer.hidden = false;
	}

	open(event: Event): void {
		const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
			"[data-more]",
		);
		if (!button) {
			return;
		}
		const card = button.closest("[data-card]");
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

	watch(): void {
		this.observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				this.extra();
			}
		});
		this.observer.observe(this.sentinel);
		if (this.hit()) {
			this.extra();
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
