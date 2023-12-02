import type { AdapterAccount } from '@auth/core/adapters';
import { relations } from 'drizzle-orm';
import { integer, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { dbSchema } from './schema';

export const users = dbSchema.table('user', {
	id: text('id').notNull().primaryKey(),
	name: text('name'),
	email: text('email').notNull(),
	emailVerified: timestamp('emailVerified', { mode: 'date' }),
	image: text('image')
});

export const usersRelations = relations(users, ({ many }) => {
	return {
		accounts: many(accounts),
		sessions: many(sessions)
	};
});

export const accounts = dbSchema.table(
	'account',
	{
		userId: text('userId')
			.notNull()
			.references(
				() => {
					return users.id;
				},
				{ onDelete: 'cascade' }
			),
		type: text('type').$type<AdapterAccount['type']>().notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('providerAccountId').notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: text('token_type'),
		scope: text('scope'),
		id_token: text('id_token'),
		session_state: text('session_state')
	},
	(account) => {
		return {
			compoundKey: primaryKey(account.provider, account.providerAccountId)
		};
	}
);

export const accountsRelations = relations(accounts, ({ one }) => {
	return {
		user: one(users, {
			fields: [accounts.userId],
			references: [users.id]
		})
	};
});

export const sessions = dbSchema.table('session', {
	sessionToken: text('sessionToken').notNull().primaryKey(),
	userId: text('userId')
		.notNull()
		.references(
			() => {
				return users.id;
			},
			{ onDelete: 'cascade' }
		),
	expires: timestamp('expires', { mode: 'date' }).notNull()
});

export const sessionsRelations = relations(sessions, ({ one }) => {
	return {
		user: one(users, {
			fields: [sessions.userId],
			references: [users.id]
		})
	};
});

export const verificationTokens = dbSchema.table(
	'verificationToken',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull()
	},
	(vt) => {
		return {
			compoundKey: primaryKey(vt.identifier, vt.token)
		};
	}
);
