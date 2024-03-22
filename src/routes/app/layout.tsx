import type { NoSerialize } from "@builder.io/qwik";
import {
	$,
	component$,
	noSerialize,
	Slot,
	useSignal,
	useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useLocation, Form } from "@builder.io/qwik-city";
import { AppLink } from "~/routes.config";
import ExternalImage from "~/components/external-image";
import { Dropdown } from "flowbite";
import { useUser } from "../v2/layout";
import { useSignOut } from "../layout";

export const onGet: RequestHandler = async ({ cacheControl }) => {
	// Control caching for this request for best performance and to reduce hosting costs:
	// https://qwik.builder.io/docs/caching/
	cacheControl({
		noCache: true,
	});
};

export const head: DocumentHead = {
	title: "Welcome to Shaq",
	meta: [
		{
			name: "description",
			content: "Shaq site description",
		},
	],
};

export default component$(() => {
	return (
		<>
			<Slot />
		</>
	);
});

export const Header = component$(() => {
	const loc = useLocation();
	const user = useUser();
	const signOut = useSignOut();
	// const logOut = useLogOut();
	// const nav = useNavigate();

	const dropdown = useSignal<NoSerialize<Dropdown>>();
	const dropdownElement = useSignal<HTMLElement>();
	const dropdownButtonElement = useSignal<HTMLButtonElement>();

	const instanceOptions = {
		id: "dropdownMenu",
		override: true,
	};

	//eslint-disable-next-line qwik/no-use-visible-task
	useVisibleTask$(() => {
		dropdown.value = noSerialize(
			new Dropdown(
				dropdownElement.value,
				dropdownButtonElement.value,
				{ placement: "bottom" },
				instanceOptions
			)
		);
	});

	const closeDropdown = $(() => {
		dropdown.value?.hide();
	});

	return (
		<nav class="sticky top-0 z-20 w-full select-none border-b border-gray-200  bg-white dark:bg-gray-900">
			<div class="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between p-4">
				<AppLink
					route="/v2/home/"
					class="flex items-center space-x-3 rtl:space-x-reverse"
				>
					{/* <img
            src="https://flowbite.com/docs/images/logo.svg"
            class="h-8"
            alt="Flowbite Logo"
          /> */}
					<span class="self-center whitespace-nowrap text-2xl font-black dark:text-white">
						Fuel Flow Exchange
					</span>
				</AppLink>
				<div class="flex items-center space-x-3 rtl:space-x-reverse md:order-2 md:space-x-0">
					<button
						ref={dropdownButtonElement}
						type="button"
						class="flex rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 md:me-0"
					>
						<span class="sr-only">Open user menu</span>
						<ExternalImage
							class="rounded-full"
							src={"https://cdn.auth0.com/avatars/df.png"}
							width={32}
							height={32}
							alt="user photo"
						/>
					</button>
					{/* <!-- Dropdown menu --> */}
					<div
						ref={dropdownElement}
						class="z-50 my-4 hidden list-none divide-y divide-gray-100 rounded-lg bg-white text-base shadow dark:divide-gray-600 dark:bg-gray-700"
						id="user-dropdown"
					>
						<div class="px-4 py-3">
							<span class="block text-sm text-gray-900 dark:text-white">
								{user.value.name}
							</span>
							<span class="block truncate text-sm text-gray-500 dark:text-gray-400">
								{user.value.email}
							</span>
						</div>
						<ul class="py-2">
							<li>
								<AppLink
									onClick$={closeDropdown}
									route="/v2/home/"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
								>
									Settings
								</AppLink>
							</li>
							<li>
								<Form action={signOut}>
									<button class="w-full">
										<p class="px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white">
											Sign out
										</p>
									</button>
								</Form>
							</li>
						</ul>
					</div>
					<button
						data-collapse-toggle="navbar-user"
						type="button"
						class="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
						aria-controls="navbar-user"
						aria-expanded="false"
					>
						<span class="sr-only">Open main menu</span>
						<svg
							class="h-5 w-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 17 14"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M1 1h15M1 7h15M1 13h15"
							/>
						</svg>
					</button>
				</div>
				<div
					class="hidden w-full items-center justify-between md:order-1 md:flex md:w-auto"
					id="navbar-user"
				>
					<ul class="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium rtl:space-x-reverse dark:border-gray-700 dark:bg-gray-800 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 md:dark:bg-gray-900">
						<li>
							<AppLink
								route="/v2/home/"
								class={{
									"block rounded bg-blue-700 px-3 py-2 text-white md:bg-transparent md:p-0 md:text-blue-700 md:dark:text-blue-500":
										loc.url.pathname === "/v2/home/",
									"block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:p-0 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-500":
										loc.url.pathname !== "/v2/home/",
								}}
								aria-current={
									loc.url.pathname === "/v2/home/" ? "page" : undefined
								}
							>
								Home
							</AppLink>
						</li>
						<li>
							<AppLink
								route="/v2/map/"
								class={{
									"block rounded bg-blue-700 px-3 py-2 text-white md:bg-transparent md:p-0 md:text-blue-700 md:dark:text-blue-500":
										loc.url.pathname === "/v2/map/",
									"block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:p-0 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-500":
										loc.url.pathname !== "/v2/map/",
								}}
								aria-current={
									loc.url.pathname === "/v2/map/" ? "page" : undefined
								}
							>
								Map
							</AppLink>
						</li>
						<li>
							<AppLink
								route="/v2/cash/"
								class={{
									"block rounded bg-blue-700 px-3 py-2 text-white md:bg-transparent md:p-0 md:text-blue-700 md:dark:text-blue-500":
										loc.url.pathname === "/v2/cash/",
									"block rounded px-3 py-2 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:p-0 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-500":
										loc.url.pathname !==
										"/https://cdn.auth0.com/avatars/df.pngv2/cash/",
								}}
								aria-current={
									loc.url.pathname === "/v2/cash/" ? "page" : undefined
								}
							>
								Cash
							</AppLink>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
});

export const RequireOnboarding = component$<{
	hasEntities: boolean;
}>((props) => {
	return (
		<div class="text-lg">
			{props.hasEntities && <p>You do not have any accounts set up.</p>}
			<p>
				Please contact us at{" "}
				<a href="mailto:nerve@finplex.com.au" class="font-semibold underline">
					nerve@finplex.com.au
				</a>{" "}
				to begin the onboarding process.
			</p>
		</div>
	);
});
