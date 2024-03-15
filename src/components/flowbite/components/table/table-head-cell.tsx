import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";
import type { DeepPartial } from "../../helpers";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { TableContext } from "./table";
import { omitProps } from "@builder.io/qwik-labs";

export type FlowbiteTableHeadCellTheme = {
	base: string;
};

type ThProps = QwikIntrinsicElements["th"];

export type TableCellProps = {
	theme?: DeepPartial<FlowbiteTableHeadCellTheme>;
} & ThProps;

export default component$<ThProps>((props) => {
	const ctx = useContext(TableContext);
	return (
		<th
			class={twMerge(clsx(ctx.value.theme.head.cell.base, props.class))}
			{...omitProps(props, ["class"])}
		>
			<Slot />
		</th>
	);
});
