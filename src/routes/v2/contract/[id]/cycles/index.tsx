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

	const totals = {
		"3-months": {
			volume: 0,
			totalCost: 0,
		},
		"next-month": {
			volume: 0,
			totalCost: 0,
		},
		"this-month": {
			volume: 0,
			totalCost: 0,
		},
		"in-transit": {
			volume: 0,
			totalCost: 0,
		},
		"settled-this-month": {
			volume: 0,
			totalCost: 0,
		},
		"settled-this-year": {
			volume: 0,
			totalCost: 0,
		},
		landed: {
			volume: 0,
			totalCost: 0,
		},
	};
	const sortedCycles: Record<CycleDateGroup, Array<(typeof cycles)[number]>> = {
		"3-months": [],
		"next-month": [],
		"this-month": [],
		"in-transit": [],
		"settled-this-month": [],
		"settled-this-year": [],
		landed: [],
	};

	const add = (key: CycleDateGroup, cycle: (typeof cycles)[number]) => {
		sortedCycles[key].push(cycle);
		totals[key].volume += Number(cycle.volume);
		totals[key].totalCost += Number(cycle.cost);
	};

	for (const cycle of cycles) {
		const m = moment(
			cycle.settlementDate ? cycle.settlementDate : cycle.expectedDate
		);

		if (m.isAfter(moment().add(3, "month"))) {
			// 3-months
			add("3-months", cycle);
			continue;
		}
		const nextMonth = moment().add(1, "month");

		if (
			m.isBetween(nextMonth.clone().startOf("month"), nextMonth.endOf("month"))
		) {
			// next month
			add("next-month", cycle);
			continue;
		}
		if (
			m.isBetween(moment().startOf("month"), moment().endOf("month").valueOf())
		) {
			// this month
			add("this-month", cycle);
			continue;
		}
		if (m.isBetween(moment().startOf("month"), moment())) {
			// settled this month
			add("settled-this-month", cycle);
			continue;
		}
		if (m.isBetween(moment().startOf("year"), moment())) {
			// settled this year
			add("settled-this-year", cycle);
			continue;
		}
	}

	return { all: cycles, sorted: sortedCycles, totals };
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
		cost: z.coerce.number().optional(),
		volume: z.coerce.number().optional(),
	})
);

export const CyclesContext = createContextId<{
	filter: Signal<string>;
}>("cycles-index");

type CycleDateGroup =
	| "3-months"
	| "next-month"
	| "this-month"
	| "settled-this-month"
	| "in-transit"
	| "settled-this-year"
	| "landed";

export default component$(() => {
	const loc = useLocation();
	const cycles = useCycles();
	const createCycle = useCreateCycle();
	const showCycleCreate = useSignal(false);
	const filter = useSignal<CycleDateGroup>("in-transit");

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
				<div class="grid grid-cols-4 gap-2 text-xs">
					<p>Date</p>
					<p>Cost</p>
					<p>Volume (MT)</p>
				</div>
				{cycles.value.sorted[filter.value].map((cycle) => (
					<AppLink
						route="/v2/contract/[id]/cycles/[cycleId]/"
						param:id={loc.params.id!}
						param:cycleId={cycle.id}
						key={cycle.id}
					>
						{/* {cycle.settlementDate} */}
						<div class="grid grid-cols-4 gap-2 rounded border bg-neutral-50 p-2 shadow hover:bg-neutral-200">
							{cycle.settlementDate ? (
								<p>{cycle.settlementDate.toLocaleDateString("en-AU")}</p>
							) : (
								<p>{cycle.expectedDate.toLocaleDateString("en-AU")}</p>
							)}
							<p>
								{cycle.cost
									? Number(cycle.cost).toLocaleString("en-AU", {
											currency: "AUD",
											style: "currency",
										})
									: "-"}
							</p>
							<p>
								{cycle.volume ? Number(cycle.volume).toLocaleString() : "-"}
							</p>
						</div>
					</AppLink>
				))}
			</div>
			{showCycleCreate.value && (
				<div class="absolute bottom-14 right-14 z-10 w-96 rounded-lg border bg-white p-4 shadow">
					<Form
						action={createCycle}
						class="flex flex-col gap-4"
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
				class="absolute bottom-6 right-6 z-20 grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-gradient-to-tr from-green-50 via-green-100 to-blue-200 shadow-xl outline-blue-400 hover:brightness-95 active:outline active:[&>*]:text-blue-700"
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
	}: PropsOf<"div"> & { filter: CycleDateGroup }) => {
		const displayContext = useContext(CyclesContext);
		const cycles = useCycles();
		const total = useComputed$(() => cycles.value.totals[filter]);
		const oilHeight = useComputed$(() => {
			const max = Math.max(
				...Object.values(cycles.value.totals).map((total) => total.volume)
			);

			return (total.value.volume / (max * 1.3)) * 100;
		});

		return (
			<div
				onClick$={[
					propClick,
					$(() => {
						displayContext.filter.value = filter;
					}),
				]}
				class={cn(
					[
						"relative flex-1 cursor-pointer overflow-hidden rounded border bg-neutral-500 py-2 text-center text-sm font-medium text-white shadow",
						{
							" border-blue-300  bg-gradient-to-tr from-green-50 via-green-100 to-blue-200 text-blue-700":
								displayContext.filter.value === filter,
						},
					],
					propClass
				)}
				{...props}
			>
				<div class="relative z-10 ">
					<Slot></Slot>
					<p class="text-xs">
						{total.value.totalCost.toLocaleString("en-AU", {
							style: "currency",
							currency: "AUD",
							notation: "compact",
						})}
					</p>
					<p class="text-xs">
						{total.value.volume.toLocaleString("en-AU", {
							notation: "compact",
						})}{" "}
						mt
					</p>
				</div>
				<div
					style={{ "--oil-height": `${oilHeight.value}%` }}
					class={[
						"absolute bottom-0 left-0 h-[var(--oil-height)] w-full bg-gradient-to-t from-neutral-900 to-neutral-700",
						{
							"opacity-20": displayContext.filter.value === filter,
						},
					]}
				></div>
			</div>
		);
	}
);
