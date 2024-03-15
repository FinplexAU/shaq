import type { IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import { TimelineContext } from "./timeline";
import { cn } from "../../helpers";
import { omitProps } from "@builder.io/qwik-labs";

export type FlowbiteTimelinePointTheme = {
	horizontal: string;
	line: string;
	marker: {
		base: {
			horizontal: string;
			vertical: string;
		};
		icon: {
			base: string;
			wrapper: string;
		};
	};
	vertical: string;
};

type DivProps = IntrinsicElements["div"];
export type TimelineBodyProps = DivProps & {};

export default component$<TimelineBodyProps>((props) => {
	const ctx = useContext(TimelineContext);

	return (
		<div
			class={cn(
				{
					[ctx.value.theme.item.point.horizontal]: ctx.value.horizontal,
					[ctx.value.theme.item.point.vertical]: !ctx.value.horizontal,
				},
				props.class
			)}
			{...omitProps(props, ["class"])}
		>
			<Slot />
			<>
				<div
					class={[
						{
							[ctx.value.theme.item.point.marker.base.horizontal]:
								ctx.value.horizontal,
							[ctx.value.theme.item.point.marker.base.vertical]:
								!ctx.value.horizontal,
						},
					]}
				/>
				{/* <span class={ctx.value.theme.item.point.marker.icon.wrapper}>
					<span class={ctx.value.theme.item.point.marker.icon.base}>
						<Slot name="icon" />
					</span>
				</span> */}
			</>
		</div>
	);
});
