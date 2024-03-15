import { type PropsOf, component$ } from "@builder.io/qwik";

export const Input = component$((props: PropsOf<"input">) => {
	return (
		<div class={{ hidden: props.type === "hidden" }}>
			<label
				for={props.id}
				class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
			>
				{props.title}
			</label>
			<input
				{...props}
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
			/>
		</div>
	);
});
