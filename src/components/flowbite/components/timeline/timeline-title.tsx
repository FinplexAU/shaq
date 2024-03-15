import type { IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useComputed$, useContext } from "@builder.io/qwik";
import { TimelineContext } from "./timeline";
import { omitProps } from "@builder.io/qwik-labs";
import { cn } from "../../helpers";

export type FlowbiteTimelineTitleTheme = {
	base: string;
};

type H1Props = IntrinsicElements["h1"];
export type TimelineTitleProps = H1Props & {
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

export default component$<TimelineTitleProps>((props) => {
	const ctx = useContext(TimelineContext);

	const Heading = useComputed$(() => props.as ?? "h3");

	return (
		<Heading.value
			class={cn(ctx.value.theme.item.content.title.base, props.class)}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</Heading.value>
	);
});
