import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const bankDetails = pgTable("bankDetails", {
	id: uuid("id").primaryKey().defaultRandom(),
});

export const entities = pgTable("entities", {
	id: uuid("id").primaryKey().defaultRandom(),
	company: text("company"),
	address: text("address"),
	bankDetailsId: uuid("bank_details_id").references(() => bankDetails.id),
});

export const contracts = pgTable("contracts", {
	id: uuid("id").primaryKey().defaultRandom(),
	product: text("product"),
	volume: text("volume"),
	logistics: text("logistics"),
	deliveryPort: text("delivery_port"),
	loadingPort: text("loading_port"),
	productPricing: text("product_pricing"),
	traderId: uuid("trader_id").references(() => entities.id),
	investorId: uuid("investor_id").references(() => entities.id),
	supplierId: uuid("supplier_id").references(() => entities.id),
	exitBuyerId: uuid("exit_buyer_id").references(() => entities.id),
});

export const documents = pgTable("documents", {
	id: uuid("id").primaryKey().defaultRandom(),
	investorApprovalRequired: boolean("investor_approval_required").notNull(),
	traderApprovalRequired: boolean("trader_approval_required").notNull(),
	// contractId:
});

export const documentVersions = pgTable("documentVersions", {
	id: uuid("id").primaryKey().defaultRandom(),
	investorApproval: timestamp("trader_approval"),
	traderApproval: timestamp("trader_approval"),
	version: integer("version").notNull(),
	createdAt: timestamp("created_at")
		.notNull()
		.$defaultFn(() => new Date()),
	documentId: uuid("document_id")
		.references(() => documents.id)
		.notNull(),
});

export const workflowStepDocuments = pgTable("workflowStepDocuments", {
	id: uuid("id").primaryKey().defaultRandom(),
	workflowStepId: uuid("workflow_step_id")
		.references(() => workflowSteps.id)
		.notNull(),
	documentId: uuid("document_id")
		.references(() => documents.id)
		.notNull(),
});

export const workflowSteps = pgTable("workflowSteps", {
	id: uuid("id").primaryKey().defaultRandom(),
	complete: boolean("complete").notNull(),
	completionReason: text("completionReason"),
	stepNumber: integer("stepNumber"),
	workflowId: uuid("workflow_id")
		.references(() => workflows.id)
		.notNull(),
});

export const workflows = pgTable("workflows", {
	id: uuid("id").primaryKey().defaultRandom(),
	complete: boolean("complete").notNull(),
	completionReason: text("completionReason"),
});

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
});

export const userEntityLinks = pgTable("userEntityLinks", {
	id: uuid("id").primaryKey().defaultRandom(),
	user_id: uuid("user_id").references(() => users.id),
	entity_id: uuid("entity_id").references(() => entities.id),
});
