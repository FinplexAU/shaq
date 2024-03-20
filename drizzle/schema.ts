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

export const contracts = pgTable("contracts", {
	id: uuid("id").primaryKey().defaultRandom(),
	product: text("product"),
	volume: numeric("volume"),
	logistics: text("logistics"),
	deliveryPort: text("delivery_port"),
	loadingPort: text("loading_port"),
	productPricing: numeric("product_pricing"),
	jointVenture: uuid("joint_venture_id").references(() => workflows.id),
	tradeSetup: uuid("trade_setup_id").references(() => workflows.id),
	bankInstrumentSetup: uuid("bank_instrument_setup_id").references(
		() => workflows.id
	),
	tradeBankInstrumentSetup: uuid("trade_bank_instrument_setup_id").references(
		() => workflows.id
	),
});

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

export const documentVersions = pgTable("document_versions", {
	id: uuid("id").primaryKey().defaultRandom(),
	investorApproval: timestamp("investor_approval"),
	traderApproval: timestamp("trader_approval"),
	documentTypeId: uuid("document_type_id").references(() => documentTypes.id),
	version: integer("version").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	workflowStepId: uuid("workflow_step_id")
		.references(() => workflowSteps.id)
		.notNull(),
});

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

export const workflows = pgTable("workflows", {
	id: uuid("id").primaryKey().defaultRandom(),
	workflowType: uuid("workflow_type").references(() => workflowTypes.id),
	complete: timestamp("complete"),
	completionReason: text("completion_reason"),
});

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	email: text("email").unique().notNull(),
	emailVerified: boolean("email_verified").notNull().default(false),
	hashedPassword: text("hashed_password").notNull(),
});

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

export const userEntityLinks = pgTable("user_entity_links", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull(),
	entityId: uuid("entity_id")
		.references(() => entities.id)
		.notNull(),
});

export const userPermissions = pgTable("user_permissions", {
	id: uuid("id").references(() => users.id),
	permissionId: uuid("permission_id").references(() => permissions.id),
});

export const permissions = pgTable("permissions", {
	id: uuid("id").primaryKey().defaultRandom(),
	permission: text("permission").notNull(),
});

export const workflowTypes = pgTable("workflow_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
});

export const workflowStepTypes = pgTable("workflow_step_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	stepNumber: integer("step_number").notNull(),
	workflowTypeId: uuid("workflow_id")
		.references(() => workflowTypes.id)
		.notNull(),
});

export const documentTypes = pgTable("document_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	documentName: text("document_name").notNull(),
	investorApprovalRequired: boolean("investor_approval_required").notNull(),
	traderApprovalRequired: boolean("trader_approval_required").notNull(),
	requiredBy: uuid("required_by")
		.references(() => workflowStepTypes.id)
		.notNull(),
});
