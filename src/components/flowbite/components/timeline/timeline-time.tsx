import type { IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import { TimelineContext } from "./timeline";
import { omitProps } from "@builder.io/qwik-labs";
import { cn } from "../../helpers";

export type FlowbiteTimelineTimeTheme = {
	base: string;
};

type TimeProps = IntrinsicElements["time"];
export type TimelineTimeProps = TimeProps & {};

export default component$<TimelineTimeProps>((props) => {
	const ctx = useContext(TimelineContext);

	return (
		<time
			class={cn(ctx.value.theme.item.content.time.base, props.class)}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</time>
	);
});
