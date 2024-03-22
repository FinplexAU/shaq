import { Slot, component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getSharedMap } from "../plugin";
import { Header } from "../app/layout";

export const useUser = routeLoader$(({ sharedMap }) => {
	return getSharedMap(sharedMap, "user");
});

export default component$(() => {
	return (
		<div class="flex min-h-screen flex-col">
			<Header></Header>
			<Slot></Slot>
		</div>
	);
});
