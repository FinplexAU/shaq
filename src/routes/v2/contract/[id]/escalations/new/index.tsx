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
import { contracts, entities, escalations } from "@/drizzle/schema";
import { sendEscalationMessage } from "~/utils/email";
import { eq } from "drizzle-orm";

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

		const contract = await db.query.contracts.findFirst({
			where: eq(contracts.id, contractId),
			columns: {},
			with: {
				entities: {
					where: eq(entities.role, "admin"),
					columns: {},
					with: {
						userEntityLinks: {
							columns: {},
							with: {
								user: {
									// Go into the actual user to not spam users who are yet to sign up
									columns: { email: true },
								},
							},
						},
					},
				},
			},
		});

		if (!contract) {
			ev.redirect(302, `/v2/contract/${contractId}/escalations/`);
			return;
		}

		const emails = contract.entities.flatMap((x) =>
			x.userEntityLinks
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				.map((y) => y.user?.email)
				.filter((email): email is string => Boolean(email))
		);

		const emailPromises = emails.map((email) =>
			sendEscalationMessage(ev.env, email, ev.url, contractId, data.title)
		);

		await Promise.allSettled(emailPromises);

		ev.redirect(302, `/v2/contract/${contractId}/escalations/`);
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
					route="/v2/contract/[id]/escalations/"
					param:id={loc.params.id!}
				>
					<Button>Cancel</Button>
				</AppLink>
			</Form>
		</>
	);
});
