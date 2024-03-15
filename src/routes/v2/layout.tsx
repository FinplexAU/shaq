import { Slot, component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getSharedMap } from "../plugin";

export const useUser = routeLoader$(({ sharedMap }) => {
	return getSharedMap(sharedMap, "user");
});

export default component$(() => {
	return (
		<div class="flex min-h-screen flex-col">
			<Slot></Slot>
		</div>
	);
});
