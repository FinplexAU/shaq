import { type PropsOf, component$, useComputed$ } from "@builder.io/qwik";
import { cn } from "./flowbite/helpers";
import { omitProps } from "@builder.io/qwik-labs";

export const Input = component$(
	(props: PropsOf<"input"> & { error?: string | string[] }) => {
		const error = useComputed$(
			() =>
				props.error &&
				(Array.isArray(props.error) ? props.error.at(0) : props.error)
		);

		const { class: className, ...rest } = props;

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
					{...rest}
					class={cn([
						"block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
						className,
						{
							"outline outline-red-700": !!error.value,
						},
					])}
				/>
				{error.value && (
					<span class="absolute text-sm text-red-500">{error.value}</span>
				)}
			</div>
		);
	}
);
