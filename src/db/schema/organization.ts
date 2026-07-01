import {
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth.ts";

export const organization = pgTable(
	"organization",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		type: text("type").notNull(),
		inviteCode: text("invite_code").notNull().unique(),
		createdByUserId: text("created_by_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		uniqueIndex("organization_invite_code_idx").on(table.inviteCode),
		index("organization_created_by_user_id_idx").on(table.createdByUserId),
	],
);

export const organizationMember = pgTable(
	"organization_member",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").default("member").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		uniqueIndex("organization_member_org_user_idx").on(
			table.organizationId,
			table.userId,
		),
		index("organization_member_user_id_idx").on(table.userId),
	],
);

export const organizationChannel = pgTable(
	"organization_channel",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		createdByUserId: text("created_by_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		uniqueIndex("organization_channel_org_slug_idx").on(
			table.organizationId,
			table.slug,
		),
		index("organization_channel_organization_id_idx").on(table.organizationId),
	],
);

export const organizationInvite = pgTable(
	"organization_invite",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		inviteCode: text("invite_code").notNull(),
		status: text("status").default("pending").notNull(),
		invitedByUserId: text("invited_by_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("organization_invite_organization_id_idx").on(table.organizationId),
		index("organization_invite_email_idx").on(table.email),
	],
);

export type Organization = typeof organization.$inferSelect;
export type OrganizationMember = typeof organizationMember.$inferSelect;
export type OrganizationChannel = typeof organizationChannel.$inferSelect;
export type OrganizationInvite = typeof organizationInvite.$inferSelect;
