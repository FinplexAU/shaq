import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { RequestHandler } from "@builder.io/qwik-city";
import { safeDb } from "~/db/db";
import { s3 } from "~/utils/aws";

// Need to add auth check for object
export const onGet: RequestHandler = async ({
	status,
	headers,
	getWritableStream,
	params,
}) => {
	const key = params.id;
	const command = new GetObjectCommand({
		Bucket: "shaq-dev",
		Key: key,
	});
	const object = await safeDb(s3.send(command));

	if (!object.success || !object.data.Body || !object.data.ContentType) {
		status(400);
		return;
	}
	status(200);
	headers.set("Content-Type", object.data.ContentType!);
	const bodyStream = object.data.Body.transformToWebStream();
	const writeStream = getWritableStream();
	bodyStream.pipeTo(writeStream);
};
