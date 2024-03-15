import type { IntrinsicElements, Signal } from "@builder.io/qwik";
import {
	Slot,
	component$,
	createContextId,
	useComputed$,
	useContext,
	useContextProvider,
} from "@builder.io/qwik";
import { mergeDeep } from "../../helpers";
import { timelineTheme } from "./theme";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { omitProps } from "@builder.io/qwik-labs";
import type { FlowbiteTimelineItemTheme } from "./timeline-item";

export type FlowbiteTimelineTheme = {
	root: {
		direction: {
			horizontal: string;
			vertical: string;
		};
	};
	item: FlowbiteTimelineItemTheme;
};

export type TimelineContext = Signal<{
	theme: FlowbiteTimelineTheme;
	horizontal: boolean;
}>;

export const TimelineContext =
	createContextId<TimelineContext>("_flowbite_timeline");

type OlProps = IntrinsicElements["ol"];

export type TimelineProps = OlProps & {
	horizontal?: boolean;
	theme?: FlowbiteTimelineTheme;
};

export default component$<TimelineProps>((props) => {
	useContextProvider<TimelineContext>(
		TimelineContext,
		useComputed$(() => ({
			theme: mergeDeep(timelineTheme, props.theme ?? {}),
			horizontal: props.horizontal ?? false,
		}))
	);

	const ctx = useContext(TimelineContext);

	return (
		<ol
			class={twMerge(
				clsx(
					{
						[ctx.value.theme.root.direction.horizontal]: ctx.value.horizontal,
						[ctx.value.theme.root.direction.vertical]: !ctx.value.horizontal,
					},
					props.class
				)
			)}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</ol>
	);
});
