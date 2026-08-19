import "./play.css";

const HOLD_MS = 300;
const OPEN_AT = 0.86;
const CLICK_PX = 10;
const CLOSE_DRAG_PX = 28;

export function mount(root: HTMLElement): () => void {
	const found = root.querySelector<HTMLElement>("[data-box]");
	if (!found) {
		return () => {};
	}
	const box: HTMLElement = found;

	let dragging = false;
	let openedThisGesture = false;
	let startY = 0;
	let startLift = 0;
	let lift = 0;
	let revealed = false;
	let holdTimer = 0;
	let pointerId = -1;

	function maxLift(): number {
		return root.getBoundingClientRect().height * 0.42;
	}

	function progress(): number {
		const max = maxLift();
		return max === 0 ? 0 : lift / max;
	}

	function setLift(next: number): void {
		const max = maxLift();
		lift = Math.min(max, Math.max(0, next));
		box.style.transform = `translateY(${-lift}px)`;
	}

	function clearHold(): void {
		window.clearTimeout(holdTimer);
		holdTimer = 0;
	}

	function lockOpen(): void {
		revealed = true;
		openedThisGesture = true;
		holdTimer = 0;
		setLift(maxLift());
		root.classList.add("is-open", "is-revealed");
		root.classList.remove("is-lifting");
	}

	function armHold(): void {
		if (revealed || holdTimer !== 0) {
			return;
		}
		holdTimer = window.setTimeout(lockOpen, HOLD_MS);
	}

	function drop(): void {
		clearHold();
		revealed = false;
		dragging = false;
		openedThisGesture = false;
		lift = 0;
		if (pointerId >= 0 && box.hasPointerCapture(pointerId)) {
			box.releasePointerCapture(pointerId);
		}
		pointerId = -1;
		root.classList.remove(
			"is-dragging",
			"is-lifting",
			"is-open",
			"is-revealed",
		);
		box.style.transform = "translateY(0)";
	}

	function apply(next: number): void {
		setLift(next);
		const t = progress();
		root.classList.toggle("is-lifting", t > 0.12 && !revealed);
		if (t > OPEN_AT) {
			armHold();
		} else {
			clearHold();
		}
	}

	function onDown(event: PointerEvent): void {
		if (event.button !== 0) {
			return;
		}
		event.preventDefault();
		dragging = true;
		openedThisGesture = false;
		pointerId = event.pointerId;
		startY = event.clientY;
		startLift = lift;
		root.classList.add("is-dragging");
		box.setPointerCapture(event.pointerId);
	}

	function onMove(event: PointerEvent): void {
		if (!dragging) {
			return;
		}
		const delta = startY - event.clientY;
		if (revealed) {
			if (delta < -CLOSE_DRAG_PX) {
				drop();
			}
			return;
		}
		apply(startLift + delta);
	}

	function onUp(event: PointerEvent): void {
		if (!dragging) {
			return;
		}
		dragging = false;
		root.classList.remove("is-dragging");
		if (box.hasPointerCapture(event.pointerId)) {
			box.releasePointerCapture(event.pointerId);
		}
		pointerId = -1;
		if (revealed) {
			if (!openedThisGesture && Math.abs(event.clientY - startY) < CLICK_PX) {
				drop();
			} else {
				setLift(maxLift());
			}
			return;
		}
		drop();
	}

	box.addEventListener("pointerdown", onDown);
	box.addEventListener("pointermove", onMove);
	box.addEventListener("pointerup", onUp);
	box.addEventListener("pointercancel", onUp);

	return () => {
		clearHold();
		box.removeEventListener("pointerdown", onDown);
		box.removeEventListener("pointermove", onMove);
		box.removeEventListener("pointerup", onUp);
		box.removeEventListener("pointercancel", onUp);
		root.classList.remove(
			"is-dragging",
			"is-lifting",
			"is-open",
			"is-revealed",
		);
		box.style.transform = "";
	};
}
