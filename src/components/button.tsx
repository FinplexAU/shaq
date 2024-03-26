import { type QwikIntrinsicElements, Slot, component$ } from "@builder.io/qwik";
import type { ClassNameValue } from "tailwind-merge";
import { twMerge } from "tailwind-merge";

export const Button = component$(
	({
		class: propClass,
		...props
	}: QwikIntrinsicElements["button"] & { class?: ClassNameValue }) => {
		return (
			<button
				class={twMerge([
					"rounded-md bg-gradient-to-t from-blue-400 to-blue-500 px-4 py-2 font-semibold text-white transition-colors duration-200 ease-in-out hover:from-blue-500 hover:to-blue-600/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:from-blue-600 active:to-blue-700/80 active:ring-2 active:ring-blue-700 active:ring-opacity-50 disabled:cursor-not-allowed disabled:from-blue-300 disabled:to-blue-400/80 disabled:opacity-80 disabled:ring-2 disabled:ring-blue-400 disabled:ring-opacity-50",
					propClass,
				])}
				{...props}
			>
				<Slot></Slot>
			</button>
		);
	}
);
