import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { RequestHandler } from "@builder.io/qwik-city";
import { s3 } from "~/utils/aws";
import { safe } from "~/utils/utils";

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
