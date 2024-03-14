import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { TableContext } from "./table";
import type { FlowbiteTableHeadCellTheme } from "./table-head-cell";
import { omitProps } from "@builder.io/qwik-labs";

export type FlowbiteTableHeadTheme = {
	base: string;
	cell: FlowbiteTableHeadCellTheme;
};

type THeadProps = QwikIntrinsicElements["thead"];

export type TableHeadProps = THeadProps & {};

export default component$<TableHeadProps>((props) => {
	const ctx = useContext(TableContext);
	return (
		<thead
			class={twMerge(clsx(ctx.value.theme.head.base, props.class))}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</thead>
	);
});
