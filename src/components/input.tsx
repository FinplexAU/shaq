import { type PropsOf, component$ } from "@builder.io/qwik";
import { cn } from "./flowbite/helpers";

export const Input = component$(
	({
		error,
		class: propClass,
		...props
	}: PropsOf<"input"> & { error?: string }) => {
		return (
			<div
				class={[
					"relative",
					{ hidden: props.type === "hidden" || props.hidden },
				]}
			>
				<label
					for={props.id}
					class=" block text-sm font-medium text-gray-900 dark:text-white"
				>
					{props.title}
				</label>
				<input
					{...props}
					class={cn([
						"block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
						propClass,
						{
							"outline outline-red-700": error,
						},
					])}
				/>
				{error && <span class="absolute text-sm text-red-500">{error}</span>}
			</div>
		);
	}
);
