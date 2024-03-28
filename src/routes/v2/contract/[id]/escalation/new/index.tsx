import { component$ } from "@builder.io/qwik";
import {
	Form,
	routeAction$,
	useLocation,
	z,
	zod$,
} from "@builder.io/qwik-city";
import { Button } from "~/components/button";
import { AppLink } from "~/routes.config";
import { Input } from "~/components/input";
import { drizzleDb } from "~/db/db";
import { escalations } from "@/drizzle/schema";

export const useCreateEscalation = routeAction$(
	async (data, ev) => {
		const contractId = ev.params.id;
		if (!contractId) {
			throw ev.error(404, "Not found");
		}
		const db = await drizzleDb;

		await db
			.insert(escalations)
			.values([{ title: data.title, body: data.body, contractId: contractId }]);

		// Needs to send emails

		ev.redirect(302, `/v2/contract/${contractId}/escalation/`);
	},
	zod$({
		title: z.string().min(1),
		body: z.string().min(1),
	})
);

export default component$(() => {
	const loc = useLocation();
	const createEscalation = useCreateEscalation();
	return (
		<>
			<Form action={createEscalation}>
				<Input
					name="title"
					title="Title"
					placeholder="Title"
					required
					error={createEscalation.value?.fieldErrors?.title}
				/>
				<Input
					name="body"
					title="Body"
					placeholder="Body"
					required
					error={createEscalation.value?.fieldErrors?.body}
				/>
				<span class="text-sm text-red-500">
					{
						// createEscalation.value?.message ||
						createEscalation.value?.formErrors
					}
				</span>
				<Button>Create</Button>
				<AppLink
					route="/v2/contract/[id]/escalation/"
					param:id={loc.params.id!}
				>
					<Button>Cancel</Button>
				</AppLink>
			</Form>
		</>
	);
});
