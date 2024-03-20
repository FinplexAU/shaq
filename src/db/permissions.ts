import { entities, userEntityLinks } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";

export const getContractPermissions = async (
	contractId: string,
	userId: string
) => {
	const db = await drizzleDb;
	const p = await db.query.entities.findMany({
		where: eq(entities.contractId, contractId),
		with: {
			userEntityLinks: {
				columns: { id: true },
				where: eq(userEntityLinks.id, userId),
			},
		},
	});

	const isAdmin = Boolean(p.find((x) => x.role === "admin"));
	const isTrader = Boolean(p.find((x) => x.role === "trader"));
	const isInvestor = Boolean(p.find((x) => x.role === "investor"));

	const isPermitted = isAdmin || isTrader || isInvestor;

	return {
		isAdmin,
		isTrader,
		isInvestor,
		isPermitted,
	};
};
