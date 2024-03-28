import { component$ } from "@builder.io/qwik";
import { useEscalations } from "./layout";
import { Button } from "~/components/button";
import { AppLink } from "~/routes.config";
import { useLocation } from "@builder.io/qwik-city";

export default component$(() => {
	const escalations = useEscalations();
	const loc = useLocation();
	console.log(escalations.value);
	return (
		<>
			<div>
				<div class="flex flex-col gap-4">
					<h1>Escalations</h1>
					{escalations.value.map((escalation) => (
						<div key={escalation.id}>
							<p class="font-bold">{escalation.title}</p>
							<p>{escalation.body}</p>
							<p>Complete: {escalation.complete ? "Yes" : "No"}</p>
						</div>
					))}
					<AppLink
						route="/v2/contract/[id]/escalations/new/"
						param:id={loc.params.id!}
					>
						<Button>New</Button>
					</AppLink>
				</div>
			</div>
		</>
	);
});
