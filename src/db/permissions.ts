import { entities, userEntityLinks } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";

export const getContractPermissions = async (
	contractId: string,
	userEmail: string
) => {
	const db = await drizzleDb;
	const entityQuery = await db.query.entities.findMany({
		where: eq(entities.contractId, contractId),
		with: {
			userEntityLinks: {
				columns: { id: true },
				where: eq(userEntityLinks.email, userEmail),
			},
		},
	});

	const isAdmin = Boolean(
		entityQuery.find(
			(entity) => entity.role === "admin" && entity.userEntityLinks.length > 0
		)
	);
	const isTrader = Boolean(
		entityQuery.find(
			(entity) => entity.role === "trader" && entity.userEntityLinks.length > 0
		)
	);
	const isInvestor = Boolean(
		entityQuery.find(
			(entity) =>
				entity.role === "investor" && entity.userEntityLinks.length > 0
		)
	);

	const isPermitted = isAdmin || isTrader || isInvestor;

	return {
		isAdmin,
		isTrader,
		isInvestor,
		isPermitted,
	};
};
