import { contracts, cycles } from "@/drizzle/schema";
import {
	type PropsOf,
	Slot,
	component$,
	useSignal,
	createContextId,
	type Signal,
	useContextProvider,
	$,
	useContext,
	useComputed$,
} from "@builder.io/qwik";
import {
	routeAction$,
	routeLoader$,
	useLocation,
	zod$,
	z,
	Form,
} from "@builder.io/qwik-city";
import { HiMinusSolid, HiPlusSolid } from "@qwikest/icons/heroicons";
import { eq } from "drizzle-orm";
import moment from "moment-timezone";
import { Button } from "~/components/button";
import Debugger from "~/components/debugger";
import { cn } from "~/components/flowbite/helpers";
import { Input } from "~/components/input";
import { drizzleDb } from "~/db/db";
import { createWorkflow } from "~/db/workflows";
import { AppLink } from "~/routes.config";
import { safe } from "~/utils/utils";

export const useCycles = routeLoader$(async (ev) => {
	const contractId = ev.params.id;
	if (!contractId) {
		throw ev.error(404, "Not found");
	}

	const db = await drizzleDb;
	const contract = await db.query.contracts.findFirst({
		where: eq(contracts.id, contractId),
		with: {
			workflows: {
				with: {
					cycle: true,
				},
			},
		},
	});

	if (!contract) {
		throw ev.error(404, "Not found");
	}

	const cycles = contract.workflows
		.map((workflow) => workflow.cycle)
		.filter((cycle): cycle is Exclude<typeof cycle, null> => Boolean(cycle));

	return cycles;
});

export const useCreateCycle = routeAction$(
	async (data, { params, error, fail }) => {
		const contractId = params.id;

		if (!contractId) {
			throw error(404, "Not found");
		}

		const db = await drizzleDb;

		const workflow = await createWorkflow("Cycle", contractId);

		const cycleInsertion = await safe(
			db
				.insert(cycles)
				.values([
					{
						workflowId: workflow.id,
						cycleNumber: 0,
						expectedDate: data.expectedDate,
						cost: data.cost?.toString(),
						volume: data.volume?.toString(),
					},
				])
				.returning({ id: cycles.id })
		);

		if (!cycleInsertion.success) {
			throw fail(500, {
				message: "Something went wrong when creating a trade cycle",
			});
		}
	},
	zod$({
		expectedDate: z.coerce.date(),
		cost: z.coerce.number(),
		volume: z.coerce.number(),
	})
);

export const CyclesContext = createContextId<{
	filter: Signal<string>;
	// totals: { volume: number; avgPrice: number };
}>("cycles-index");

export default component$(() => {
	const loc = useLocation();
	const cycles = useCycles();
	const createCycle = useCreateCycle();
	const showCycleCreate = useSignal(false);
	const filter = useSignal("in-transit");

	const filteredCycles = useComputed$(() => {
		const dateFilter = (date: Date, dateType: "settled" | "expected") => {
			const m = moment(date);
			switch (filter.value) {
				case "3-months":
					return m.isAfter(moment().add(3, "month"));
				case "next-month":
					// expected between the first and last of next month
					const nextMonth = moment().add(1, "month");
					return m.isBetween(
						nextMonth.startOf("month"),
						nextMonth.endOf("month")
					);
				case "this-month":
					// settled this month
					return m.isSameOrBefore(moment().endOf("month").valueOf());
				case "settled-this-month":
					if (dateType === "settled")
						return m.isBetween(moment().startOf("month"), moment());
					break;
				case "settled-this-year":
					if (dateType === "settled")
						return m.isBetween(moment().startOf("year"), moment());
					break;
				default:
					return false;
			}
		};

		return cycles.value.filter((cycle) => {
			return cycle.settlementDate
				? dateFilter(cycle.settlementDate, "settled")
				: dateFilter(cycle.expectedDate, "expected");
		});
	});

	// const totals = useComputed$(() => {
	// 	return filteredCycles.value.reduce<{ volume: number; avgPrice: number }>(
	// 		(a, b, i) => ({
	// 			volume: a.volume + Number(b.volume),
	// 			avgPrice: (a.volume + Number(b.cost)) / (i + 1),
	// 		}),
	// 		{ volume: 0, avgPrice: 0 }
	// 	);
	// });

	useContextProvider(CyclesContext, { filter });

	return (
		<div class="relative h-full">
			<div class="bg-2 flex flex-row gap-2 border-b p-2 shadow shadow-blue-50">
				<CycleTab filter="3-months">In 3+ Months</CycleTab>
				<CycleTab filter="next-month">Next Month</CycleTab>
				<CycleTab filter="this-month">This Month</CycleTab>
				<CycleTab filter="in-transit">In Transit</CycleTab>
				<CycleTab filter="landed">Landed</CycleTab>
				<CycleTab filter="settled-this-month">Settled This Month</CycleTab>
				<CycleTab filter="settled-this-year">Settled This Year</CycleTab>
			</div>
			{/* <Form action={createCycle}>
				<Input
					error={createCycle.value?.fieldErrors?.expectedDate}
					type="date"
					title="Expected Settlement Date"
					name="expectedDate"
					class="w-52"
				></Input>
				<Button type="submit">Create a new trade cycle</Button>
			</Form> */}
			<div class="flex flex-col gap-2 p-4">
				{filteredCycles.value.map((cycle) => (
					<AppLink
						route="/v2/contract/[id]/cycles/[cycleId]/"
						param:id={loc.params.id!}
						param:cycleId={cycle.id}
						key={cycle.id}
					>
						{/* {cycle.settlementDate} */}
						<div class="rounded border bg-neutral-50 p-2 shadow hover:bg-neutral-200">
							<p>Expected: {cycle.expectedDate.toLocaleDateString([])}</p>
							<p>Settles: {cycle.settlementDate?.toLocaleDateString([])}</p>
							{/* <p>{props.contract.}</p> */}
						</div>
					</AppLink>
				))}
			</div>
			{showCycleCreate.value && (
				<div class="absolute bottom-12 right-12 z-10 rounded-lg border bg-white p-2 shadow">
					<Form
						action={createCycle}
						class="flex flex-col gap-2"
						onSubmit$={() => {
							showCycleCreate.value = false;
						}}
					>
						<h3 class="text-2xl font-bold">Add Cycle</h3>
						<Input title="Cost" type="number" name="cost" />
						<Input title="Volume" type="number" name="volume" />
						<Input
							error={createCycle.value?.fieldErrors?.expectedDate}
							type="date"
							title="Expected Settlement Date"
							name="expectedDate"
						></Input>
						<Button type="submit">Create a new trade cycle</Button>
					</Form>
				</div>
			)}
			<div
				onClick$={() => {
					showCycleCreate.value = !showCycleCreate.value;
				}}
				class="absolute bottom-6 right-6 z-20 grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-gradient-to-tr from-green-50 via-green-100 to-blue-200 shadow-lg outline-blue-400 hover:brightness-95 active:outline active:[&>*]:text-blue-700"
			>
				{showCycleCreate.value ? (
					<HiMinusSolid class="text-xl"></HiMinusSolid>
				) : (
					<HiPlusSolid class="text-xl"></HiPlusSolid>
				)}
			</div>
		</div>
		// <div class="max-w-prose p-8">

		// </div>
	);
});

export const CycleTab = component$(
	({
		class: propClass,
		onClick$: propClick,
		filter,
		...props
	}: PropsOf<"div"> & { filter: string }) => {
		const cycles = useContext(CyclesContext);
		return (
			<div
				onClick$={[
					propClick,
					$(() => {
						cycles.filter.value = filter;
					}),
				]}
				class={cn(
					[
						"flex-1 cursor-pointer rounded border py-2 text-center text-sm",
						{
							" border-blue-300  bg-gradient-to-tr from-green-50 via-green-100 to-blue-200 text-blue-700":
								cycles.filter.value === filter,
						},
					],
					propClass
				)}
				{...props}
			>
				<Slot></Slot>
			</div>
		);
	}
);
