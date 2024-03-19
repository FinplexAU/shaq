import type { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import mail from "@sendgrid/mail";
import { getRequiredEnv } from "~/routes/plugin";

export const sendEmail = async (
	env: EnvGetter,
	data: Parameters<(typeof mail)["send"]>[0]
) => {
	mail.setApiKey(getRequiredEnv(env, "SENDGRID_KEY"));
	return await mail.send(data);
};

export const sendVerificationCode = async (
	env: EnvGetter,
	email: string,
	code: string
) => {
	console.log(email, code);
	const result = await sendEmail(env, {
		from: "noreply@finplex.com.au",
		to: email,
		subject: "Diesel Platform Verification Code",
		text: `Thank you for registering with the Diesel Platform. Your verification code is ${code}, it will expire in 15 minutes`,
	});
	console.log(result);
};
