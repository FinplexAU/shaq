import type { IntrinsicElements, Signal } from "@builder.io/qwik";
import {
	Slot,
	component$,
	createContextId,
	useComputed$,
	useContext,
	useContextProvider,
} from "@builder.io/qwik";
import { tableTheme } from "./theme";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { DeepPartial } from "../../helpers";
import { mergeDeep } from "../../helpers";
import type { FlowbiteTableBodyTheme } from "./table-body";
import type { FlowbiteTableRowTheme } from "./table-row";
import type { FlowbiteTableHeadTheme } from "./table-head";
import { omitProps } from "@builder.io/qwik-labs";

export interface FlowbiteTableTheme {
	root: FlowbiteTableRootTheme;
	head: FlowbiteTableHeadTheme;
	row: FlowbiteTableRowTheme;
	body: FlowbiteTableBodyTheme;
}

export interface FlowbiteTableRootTheme {
	base: string;
	shadow: string;
	wrapper: string;
}

export type TableContext = Signal<{
	theme: FlowbiteTableTheme;
	striped: boolean;
	hoverable: boolean;
}>;

export const TableContext = createContextId<TableContext>("_flowbite_table");

type TableElementProps = IntrinsicElements["table"];

export type TableProps = TableElementProps & {
	striped?: boolean;
	hoverable?: boolean;
	theme?: DeepPartial<FlowbiteTableTheme>;
};

export default component$<TableProps>((props) => {
	useContextProvider<TableContext>(
		TableContext,
		useComputed$(() => ({
			theme: mergeDeep(tableTheme, props.theme ?? {}),
			striped: props.striped ?? false,
			hoverable: props.hoverable ?? false,
		}))
	);
	const ctx = useContext(TableContext);

	return (
		<div class={ctx.value.theme.root.wrapper}>
			<div
				class={twMerge(clsx(ctx.value.theme.root.shadow, props.class))}
			></div>
			<table
				class={twMerge(clsx(ctx.value.theme.root.base, props.class))}
				{...omitProps(props, ["class", "hoverable", "striped"])}
			>
				<Slot />
			</table>
		</div>
	);
});
