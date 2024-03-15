import type { IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import { TimelineContext } from "./timeline";
import { cn } from "../../helpers";
import { omitProps } from "@builder.io/qwik-labs";

export type FlowbiteTimelineBodyTheme = {
	base: string;
};

type DivProps = IntrinsicElements["div"];
export type TimelineBodyProps = DivProps & {};

export default component$<TimelineBodyProps>((props) => {
	const ctx = useContext(TimelineContext);

	return (
		<div
			class={cn(ctx.value.theme.item.content.body.base, props.class)}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</div>
	);
});
