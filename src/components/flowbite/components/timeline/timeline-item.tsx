import type { IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import { TimelineContext } from "./timeline";
import { omitProps } from "@builder.io/qwik-labs";
import { cn } from "../../helpers";
import type { FlowbiteTimelineContentTheme } from "./timeline-content";
import type { FlowbiteTimelinePointTheme } from "./timeline-point";

export type FlowbiteTimelineItemTheme = {
	root: {
		horizontal: string;
		vertical: string;
	};
	content: FlowbiteTimelineContentTheme;
	point: FlowbiteTimelinePointTheme;
};

type LiProps = IntrinsicElements["li"];
export type TimelineItemProps = LiProps & {};

export default component$<TimelineItemProps>((props) => {
	const ctx = useContext(TimelineContext);

	return (
		<li
			class={cn(
				{
					[ctx.value.theme.item.root.horizontal]: ctx.value.horizontal,
					[ctx.value.theme.item.root.vertical]: !ctx.value.horizontal,
				},
				props.class
			)}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</li>
	);
});
