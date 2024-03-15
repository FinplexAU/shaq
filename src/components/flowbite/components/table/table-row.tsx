import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { TableContext } from "./table";
import { omitProps } from "@builder.io/qwik-labs";

export type FlowbiteTableRowTheme = {
	base: string;
	hovered: string;
	striped: string;
};

type TdProps = QwikIntrinsicElements["tr"];

export type TableRowProps = TdProps & {};

export default component$<TableRowProps>((props) => {
	const ctx = useContext(TableContext);
	return (
		<tr
			class={twMerge(
				clsx(
					ctx.value.theme.row.base,
					{
						[ctx.value.theme.row.striped]: ctx.value.striped,
						[ctx.value.theme.row.hovered]: ctx.value.hoverable,
					},
					props.class
				)
			)}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</tr>
	);
});
