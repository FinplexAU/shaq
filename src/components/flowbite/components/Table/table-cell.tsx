import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import type { DeepPartial } from "../../helpers";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { TableContext } from "./table";
import { omitProps } from "@builder.io/qwik-labs";

export type FlowbiteTableCellTheme = {
	base: string;
};

type TdProps = QwikIntrinsicElements["td"];

export type TableCellProps = {
	theme?: DeepPartial<FlowbiteTableCellTheme>;
} & TdProps;

export default component$<TdProps>((props) => {
	const ctx = useContext(TableContext);
	return (
		<td
			class={twMerge(clsx(ctx.value.theme.body.cell.base, props.class))}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</td>
	);
});
