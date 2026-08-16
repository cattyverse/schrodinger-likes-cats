<script lang="ts">
import { add } from "./add";

type Props = {
	label: string;
};

let { label }: Props = $props();
let count = $state(0);

function bump() {
	count = add(count, 1);
}
</script>

<button type="button" onclick={bump}>{label}: {count}</button>
