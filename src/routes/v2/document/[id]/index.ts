import { contracts, documentVersions, userEntityLinks } from "@/drizzle/schema";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { z, type RequestHandler } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import { getSharedMap } from "~/routes/plugin";
import { s3 } from "~/utils/aws";
import { selectFirst } from "~/utils/drizzle-utils";
import { safe } from "~/utils/utils";

// Need to add auth check for object
export const onGet: RequestHandler = async ({
	status,
	headers,
	getWritableStream,
	params,
	sharedMap,
}) => {
	const key = z.string().uuid().safeParse(params.id);
	if (!key.success) {
		status(404);
		return;
	}
	const db = await drizzleDb;
	const user = getSharedMap(sharedMap, "user");

	const documentVersion = await safe(
		db.query.documentVersions
			.findMany({
				where: eq(documentVersions.id, key.data),
				columns: {},
				with: {
					workflowStep: {
						columns: {},
						with: {
							workflow: {
								columns: { contractId: true },
							},
						},
					},
				},
			})
			.then(selectFirst)
	);

	if (!documentVersion.success) {
		status(404);
		return;
	}

	const contract = await safe(
		db.query.contracts.findFirst({
			where: eq(contracts.id, documentVersion.workflowStep.workflow.contractId),
			columns: {},
			with: {
				entities: {
					columns: {},
					with: {
						userEntityLinks: {
							where: eq(userEntityLinks.email, user.email),
							columns: {},
							with: {
								user: true,
							},
						},
					},
				},
			},
		})
	);

	if (!contract.success) {
		status(404);
		return;
	}

	const users = contract.entities.flatMap((x) =>
		x.userEntityLinks.map((y) => y.user)
	);

	if (users.length === 0) {
		status(404);
		return;
	}

	const command = new GetObjectCommand({
		Bucket: "shaq-dev",
		Key: key.data,
	});
	const object = await safe(s3.send(command));

	if (!object.success || !object.Body || !object.ContentType) {
		status(404);
		return;
	}

	status(200);
	headers.set("Content-Type", object.ContentType!);
	const bodyStream = object.Body.transformToWebStream();
	const writeStream = getWritableStream();
	bodyStream.pipeTo(writeStream);
};
