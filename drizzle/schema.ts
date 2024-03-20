import { relations } from "drizzle-orm";
import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	numeric,
	pgEnum,
} from "drizzle-orm/pg-core";

export const bankDetails = pgTable("bank_details", {
	id: uuid("id").primaryKey().defaultRandom(),
});
export const bankDetailsRelations = relations(bankDetails, ({ many }) => ({
	entities: many(entities),
}));

export const contracts = pgTable("contracts", {
	id: uuid("id").primaryKey().defaultRandom(),
	product: text("product"),
	volume: numeric("volume"),
	logistics: text("logistics"),
	deliveryPort: text("delivery_port"),
	loadingPort: text("loading_port"),
	productPricing: numeric("product_pricing"),
});
export const contractsRelations = relations(contracts, ({ many }) => ({
	workflows: many(workflows),
	entities: many(entities),
	tradeBankInstrumentSetup: many(workflows),
}));

export const entityRole = pgEnum("entity_role", [
	"admin",
	"trader",
	"investor",
	"supplier",
	"exitBuyer",
]);

export const entities = pgTable("entities", {
	id: uuid("id").primaryKey().defaultRandom(),
	contractId: uuid("contract_id")
		.references(() => contracts.id)
		.notNull(),
	company: text("company"),
	address: text("address"),
	companyRegistration: text("company_registration"),
	bankDetailsId: uuid("bank_details_id").references(() => bankDetails.id),
	role: entityRole("role").notNull(),
});

export const entitiesRelations = relations(entities, ({ many, one }) => ({
	userEntityLinks: many(userEntityLinks),
	bankDetails: one(bankDetails, {
		fields: [entities.bankDetailsId],
		references: [bankDetails.id],
	}),
	contract: one(contracts, {
		fields: [entities.contractId],
		references: [contracts.id],
	}),
}));

export const documentVersions = pgTable("document_versions", {
	id: uuid("id").primaryKey().defaultRandom(),
	investorApproval: timestamp("investor_approval"),
	traderApproval: timestamp("trader_approval"),
	documentTypeId: uuid("document_type_id")
		.references(() => documentTypes.id)
		.notNull(),
	version: integer("version").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	workflowStepId: uuid("workflow_step_id")
		.references(() => workflowSteps.id)
		.notNull(),
});
export const documentVersionsRelations = relations(
	documentVersions,
	({ one }) => ({
		documentType: one(documentTypes, {
			fields: [documentVersions.documentTypeId],
			references: [documentTypes.id],
		}),
		workflowStep: one(workflowSteps, {
			fields: [documentVersions.workflowStepId],
			references: [workflowSteps.id],
		}),
	})
);

export const workflowSteps = pgTable("workflow_steps", {
	id: uuid("id").primaryKey().defaultRandom(),
	complete: timestamp("complete"),
	completionReason: text("completion_reason"),
	workflowId: uuid("workflow_id")
		.references(() => workflows.id)
		.notNull(),
	stepType: uuid("step_type")
		.references(() => workflowStepTypes.id)
		.notNull(),
});
export const workflowStepsRelations = relations(
	workflowSteps,
	({ many, one }) => ({
		workflow: one(workflows, {
			fields: [workflowSteps.workflowId],
			references: [workflows.id],
		}),
		stepType: one(workflowStepTypes, {
			fields: [workflowSteps.stepType],
			references: [workflowStepTypes.id],
		}),
		documentVersions: many(documentVersions),
	})
);

export const workflows = pgTable("workflows", {
	id: uuid("id").primaryKey().defaultRandom(),
	contractId: uuid("contract_id")
		.references(() => contracts.id)
		.notNull(),
	workflowType: uuid("workflow_type")
		.references(() => workflowTypes.id)
		.notNull(),
	complete: timestamp("complete"),
	completionReason: text("completion_reason"),
});

export const workflowsRelations = relations(workflows, ({ many, one }) => ({
	workflowSteps: many(workflowSteps),
	contract: one(contracts, {
		fields: [workflows.contractId],
		references: [contracts.id],
	}),
	workflowType: one(workflowTypes, {
		fields: [workflows.workflowType],
		references: [workflowTypes.id],
	}),
}));

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	email: text("email").unique().notNull(),
	emailVerified: boolean("email_verified").notNull().default(false),
	hashedPassword: text("hashed_password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(userSessions),
	emailVerificationCodes: many(userEmailVerificationCodes),
	userEntityLinks: many(userEntityLinks),
}));

export const userSessions = pgTable("user_session", {
	id: uuid("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id],
	}),
}));

export const userEmailVerificationCodes = pgTable(
	"user_email_verification_codes",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		code: text("code").notNull(),
		userId: uuid("user_id")
			.references(() => users.id)
			.unique()
			.notNull(),
		expiresAt: timestamp("expires_at", {
			withTimezone: true,
			mode: "date",
		}).notNull(),
	}
);

export const userEmailVerificationCodesRelations = relations(
	userEmailVerificationCodes,
	({ one }) => ({
		user: one(users, {
			fields: [userEmailVerificationCodes.userId],
			references: [users.id],
		}),
	})
);

export const userEntityLinks = pgTable("user_entity_links", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull(),
	entityId: uuid("entity_id")
		.references(() => entities.id)
		.notNull(),
});

export const userEntityLinksRelation = relations(
	userEntityLinks,
	({ one }) => ({
		user: one(users, {
			fields: [userEntityLinks.email],
			references: [users.email],
		}),
		entity: one(entities, {
			fields: [userEntityLinks.entityId],
			references: [entities.id],
		}),
	})
);

export const workflowTypes = pgTable("workflow_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
});
export const workflowTypesRelations = relations(workflowTypes, ({ many }) => ({
	workflows: many(workflows),
	workflowStepTypes: many(workflowStepTypes),
}));

export const workflowStepTypes = pgTable("workflow_step_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	stepNumber: integer("step_number").notNull(),
	workflowTypeId: uuid("workflow_id")
		.references(() => workflowTypes.id)
		.notNull(),
});

export const workflowStepTypesRelations = relations(
	workflowStepTypes,
	({ many, one }) => ({
		documentTypes: many(documentTypes),
		workflowSteps: many(workflowSteps),
		workflowType: one(workflowTypes, {
			fields: [workflowStepTypes.workflowTypeId],
			references: [workflowTypes.id],
		}),
	})
);

export const documentTypes = pgTable("document_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	documentName: text("document_name").notNull(),
	investorApprovalRequired: boolean("investor_approval_required").notNull(),
	traderApprovalRequired: boolean("trader_approval_required").notNull(),
	requiredBy: uuid("required_by")
		.references(() => workflowStepTypes.id)
		.notNull(),
});

export const documentTypeRelations = relations(
	documentTypes,
	({ one, many }) => ({
		workflowStepType: one(workflowStepTypes, {
			fields: [documentTypes.requiredBy],
			references: [workflowStepTypes.id],
		}),
		documentVersions: many(documentVersions),
	})
);
