import { Slot, component$ } from "@builder.io/qwik";

export default component$(() => {
	return (
		<div class="grid h-screen w-screen p-16">
			<div class="w-full place-self-center sm:w-96">
				<Slot />
			</div>
		</div>
	);
});
