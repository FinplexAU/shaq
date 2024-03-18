import { contracts, userEntityLinks } from "@/drizzle/schema";
import { and, eq, or } from "drizzle-orm";
import { drizzleDb } from "~/db/db";
import { throwIfNone } from "../utils/drizzle-utils";

export const getContractPermissions = async (
	contractId: string,
	userId: string
) => {
	const db = await drizzleDb;
	const permissionLookup = await db
		.select({
			entityId: userEntityLinks.entityId,
			adminId: contracts.adminId,
			traderId: contracts.traderId,
			investorId: contracts.investorId,
		})
		.from(contracts)
		.innerJoin(
			userEntityLinks,
			or(
				eq(userEntityLinks.entityId, contracts.adminId),
				eq(userEntityLinks.entityId, contracts.traderId),
				eq(userEntityLinks.entityId, contracts.investorId)
			)
		)
		.where(
			and(eq(userEntityLinks.userId, userId), eq(contracts.id, contractId))
		)
		.then(throwIfNone);

	const isAdmin = Boolean(
		permissionLookup.find((x) => x.entityId === x.adminId)
	);
	const isTrader = Boolean(
		permissionLookup.find((x) => x.entityId === x.traderId)
	);
	const isInvestor = Boolean(
		permissionLookup.find((x) => x.entityId === x.investorId)
	);

	const isPermitted = isAdmin || isTrader || isInvestor;

	return {
		isAdmin,
		isTrader,
		isInvestor,
		isPermitted,
	};
};
