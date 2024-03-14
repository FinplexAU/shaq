import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	numeric,
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
	volume: numeric("volume"),
	logistics: text("logistics"),
	deliveryPort: text("delivery_port"),
	loadingPort: text("loading_port"),
	productPricing: numeric("product_pricing"),
	jointVenture: uuid("joint_venture_id").references(() => workflows.id),
	traderId: uuid("trader_id").references(() => entities.id),
	investorId: uuid("investor_id").references(() => entities.id),
	supplierId: uuid("supplier_id").references(() => entities.id),
	exitBuyerId: uuid("exit_buyer_id").references(() => entities.id),
	adminId: uuid("admin_id")
		.references(() => entities.id)
		.notNull(),
});

export const documents = pgTable("documents", {
	id: uuid("id").primaryKey().defaultRandom(),
	documentType: uuid("document_type").references(() => documentTypes.id),
});

export const documentVersions = pgTable("document_versions", {
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

export const workflowStepDocuments = pgTable("workflow_step_documents", {
	id: uuid("id").primaryKey().defaultRandom(),
	workflowStepId: uuid("workflow_step_id")
		.references(() => workflowSteps.id)
		.notNull(),
	documentId: uuid("document_id")
		.references(() => documents.id)
		.notNull(),
});

export const workflowSteps = pgTable("workflow_steps", {
	id: uuid("id").primaryKey().defaultRandom(),
	complete: boolean("complete").notNull(),
	completionReason: text("completion_reason"),
	workflowId: uuid("workflow_id")
		.references(() => workflows.id)
		.notNull(),
	stepType: uuid("step_type").references(() => workflowStepTypes.id),
});

export const workflows = pgTable("workflows", {
	id: uuid("id").primaryKey().defaultRandom(),
	complete: boolean("complete").notNull(),
	completionReason: text("completion_reason"),
});

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
});

export const userEntityLinks = pgTable("user_entity_links", {
	id: uuid("id").primaryKey().defaultRandom(),
	user_id: uuid("user_id").references(() => users.id),
	entity_id: uuid("entity_id").references(() => entities.id),
});

export const userPermissions = pgTable("user_permissions", {
	id: uuid("id").references(() => users.id),
	permissionId: uuid("permission_id").references(() => permissions.id),
});

export const permissions = pgTable("permissions", {
	id: uuid("id").primaryKey().defaultRandom(),
	permission: text("permission"),
});

export const workflowTypes = pgTable("workflow_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
});

export const workflowStepTypes = pgTable("workflow_step_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	stepNumber: integer("step_number"),
	workflow: uuid("workflow_id").references(() => workflowTypes.id),
});

export const documentTypes = pgTable("document_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	documentName: text("document_name").notNull(),
	investorApprovalRequired: boolean("investor_approval_required").notNull(),
	traderApprovalRequired: boolean("trader_approval_required").notNull(),
	requiredBy: uuid("required_by").references(() => workflowStepTypes.id),
});
