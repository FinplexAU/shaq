import { $, Slot, component$, useOnDocument } from "@builder.io/qwik";
import {
	globalAction$,
	useNavigate,
	type RequestHandler,
} from "@builder.io/qwik-city";
import { getSharedMap } from "./plugin";
import { safe } from "~/utils/utils";

export const onGet: RequestHandler = async ({ cacheControl }) => {
	// Control caching for this request for best performance and to reduce hosting costs:
	// https://qwik.builder.io/docs/caching/
	cacheControl({
		noCache: true,
	});
};

export const useSignOut = globalAction$(async (_, req) => {
	const lucia = getSharedMap(req.sharedMap, "lucia");
	const session = getSharedMap(req.sharedMap, "session");

	const result = await safe(lucia.invalidateSession(session.id));
	if (!result) {
		return;
	}
	const sessionCookie = lucia.createBlankSessionCookie();
	req.cookie.set(
		sessionCookie.name,
		sessionCookie.value,
		sessionCookie.attributes
	);

	throw req.redirect(302, "/");
});

export default component$(() => {
	const nav = useNavigate();
	useOnDocument(
		"visibilitychange",
		$(() => {
			if (document.visibilityState === "visible") nav();
		})
	);
	return <Slot></Slot>;
});
