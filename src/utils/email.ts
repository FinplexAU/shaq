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
		from: {
			email: "noreply@finplex.com.au",
			name: "Diesel Platform",
		},
		to: email,
		subject: "Diesel Platform Verification Code",
		text: `Thank you for registering with the Diesel Platform. Your verification code is ${code}, it will expire in 15 minutes`,
	});
	console.log(result);
};

export const sendContractInvite = async (
	env: EnvGetter,
	email: string,
	baseUrl: URL,
	contractId: string,
	newUser: boolean
) => {
	let emailContent;
	if (newUser) {
		const accessUrl = new URL(`/v2/contract/${contractId}/`, baseUrl);
		emailContent = `You were added to a new contract. You can access it here: ${accessUrl.toString()}`;
	} else {
		const accessUrl = new URL(`/auth/sign-up/`, baseUrl);
		emailContent = `You were invited to manage a contract. Please sign up here: ${accessUrl.toString()}`;
	}
	const result = await sendEmail(env, {
		from: {
			email: "noreply@finplex.com.au",
			name: "Diesel Platform",
		},
		to: email,
		subject: "You have been invited to a contract",
		text: emailContent,
	});
	console.log(result);
};
