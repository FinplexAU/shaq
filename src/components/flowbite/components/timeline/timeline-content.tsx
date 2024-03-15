import type { IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import { TimelineContext } from "./timeline";
import { omitProps } from "@builder.io/qwik-labs";
import { cn } from "../../helpers";
import type { FlowbiteTimelineBodyTheme } from "./timeline-body";
import type { FlowbiteTimelineTimeTheme } from "./timeline-time";
import type { FlowbiteTimelineTitleTheme } from "./timeline-title";

export type FlowbiteTimelineContentTheme = {
	root: {
		base: string;
	};
	time: FlowbiteTimelineTimeTheme;
	title: FlowbiteTimelineTitleTheme;
	body: FlowbiteTimelineBodyTheme;
};

type DivProps = IntrinsicElements["div"];
export type TimelineContentProps = DivProps & {};

export default component$<TimelineContentProps>((props) => {
	const ctx = useContext(TimelineContext);

	return (
		<div
			class={cn(
				{
					[ctx.value.theme.item.content.root.base]: ctx.value.horizontal,
				},
				props.class
			)}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</div>
	);
});
