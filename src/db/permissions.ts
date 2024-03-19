import { entities, userEntityLinks, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import { throwIfNone } from "../utils/drizzle-utils";

export const getContractPermissions = async (
	contractId: string,
	userId: string
) => {
	const db = await drizzleDb;
	const permissionLookup = await db
		.select()
		.from(entities)
		.innerJoin(userEntityLinks, eq(userEntityLinks.entityId, entities.id))
		.innerJoin(users, eq(users.email, userEntityLinks.email))
		.where(and(eq(users.id, userId), eq(entities.contractId, contractId)))
		.then(throwIfNone);

	const isAdmin = Boolean(
		permissionLookup.find((x) => x.entities.role === "admin")
	);
	const isTrader = Boolean(
		permissionLookup.find((x) => x.entities.role === "trader")
	);
	const isInvestor = Boolean(
		permissionLookup.find((x) => x.entities.role === "investor")
	);

	const isPermitted = isAdmin || isTrader || isInvestor;

	return {
		isAdmin,
		isTrader,
		isInvestor,
		isPermitted,
	};
};
