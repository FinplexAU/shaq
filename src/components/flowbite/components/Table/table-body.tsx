import type { ClassList, IntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import type { FlowbiteTableCellTheme } from "./table-cell";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { TableContext } from "./table";
import { omitProps } from "@builder.io/qwik-labs";
export type FlowbiteTableBodyTheme = {
	base: string;
	cell: FlowbiteTableCellTheme;
};

type HtmlTableBodyProps = IntrinsicElements["tbody"];
export type TableBodyProps = HtmlTableBodyProps & { class?: ClassList };

export default component$<TableBodyProps>((props) => {
	const ctx = useContext(TableContext);

	return (
		<tbody
			class={twMerge(clsx(ctx.value.theme.body.base, props.class))}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</tbody>
	);
});
