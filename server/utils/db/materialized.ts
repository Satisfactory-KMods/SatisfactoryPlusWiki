import { ViewBaseConfig, sql } from 'drizzle-orm';
import type { PgMaterializedView } from 'drizzle-orm/pg-core';
import { PgDialect } from 'drizzle-orm/pg-core';
import { PgViewBase } from 'drizzle-orm/pg-core/view-base';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import type { ScheduleOptions } from 'node-cron';
import { schedule } from 'node-cron';
import { z } from 'zod';
import { log } from '../../../utils/logger';
import { queryToFullSQLString } from './utils';

const matSchema = z.enum(['MATERIALIZED VIEW', 'VIEW']).default('MATERIALIZED VIEW');
export interface MaterializedMigration {
	migrationDb: PostgresJsDatabase<any>;
	service: string;
	imports: any;
	logQuerys?: boolean;
	type?: z.infer<typeof matSchema>;
}

const pgDialect = new PgDialect();
const matTable = sql.raw('"drizzle"."__materialized_migrations"');

export async function migrateMaterialized({
	migrationDb,
	service,
	imports,
	logQuerys = false,
	type
}: MaterializedMigration) {
	type = matSchema.parse(type);
	const typeRaw = sql.raw(type);

	const builders: PgViewBase[] = Object.values<PgViewBase>(imports).filter((it) => {
		return it instanceof PgViewBase;
	});

	log('drizzle', 'Creating materialized view schema and table if not exists');
	await migrationDb.execute<any>(
		sql`
			CREATE SCHEMA IF NOT EXISTS "drizzle";
			CREATE TABLE IF NOT EXISTS ${matTable} (
				tablename varchar(255) not null,
				service varchar(255) not null,
				tabletype varchar(255) not null,
				primary key (tablename)
			);
			ALTER TABLE IF EXISTS ${matTable} ADD COLUMN IF NOT EXISTS "tabletype" varchar(255) not null default 'MATERIALIZED VIEW';
		`
	);

	const existingTables = await migrationDb.execute<{
		table: string;
		service: string;
		tabletype: string;
	}>(
		sql`select tablename as table, service, tabletype from ${matTable} where service = ${service} and tabletype = ${type}`
	);
	log(
		'drizzle',
		`Existing ${existingTables.length} mat. tables, to be migrated: ${builders.length}`
	);

	await migrationDb
		.transaction(async (tx) => {
			const migratedTables = new Set<string>();

			for (const builder of builders) {
				// @ts-ignore
				const { query, name: tableName, schema } = builder[ViewBaseConfig];
				const queryString = queryToFullSQLString(pgDialect.sqlToQuery(query), logQuerys);

				let schemaString = tableName;
				if (schema) {
					schemaString = `"${schema}"."${tableName}"`;
				}

				await tx.execute(
					sql`
						INSERT INTO ${matTable} ("tablename", "service", "tabletype") VALUES(${schemaString}, ${service}, ${type}) ON CONFLICT DO NOTHING;
					`
				);

				if (type === 'MATERIALIZED VIEW') {
					await tx.execute(
						sql`
							DROP ${typeRaw} IF EXISTS ${sql.raw(schemaString)};
							CREATE ${typeRaw} IF NOT EXISTS ${sql.raw(schemaString)} AS (${sql.raw(queryString)}) WITH DATA;
						`
					);
				} else {
					await tx.execute(
						sql`
							DROP ${typeRaw} IF EXISTS ${sql.raw(schemaString)};
							CREATE OR REPLACE ${typeRaw} ${sql.raw(schemaString)} AS (${sql.raw(queryString)});
						`
					);
				}

				migratedTables.add(schemaString);
				log('drizzle', `Migrated ${type} ${schemaString}`);
			}

			const tablesToDelete = existingTables.filter((it) => {
				return !migratedTables.has(it.table);
			});

			for (const { table } of tablesToDelete) {
				await tx.execute(
					sql`
						delete from ${matTable} where tablename = ${table} and service = ${service};
					`
				);

				await tx.execute(
					sql`
						DROP ${typeRaw} IF EXISTS ${sql.raw(table)};
					`
				);
				log('drizzle', `Deleted ${table}; Reason: not in migration`);
			}
		})
		.catch((e) => {
			log('error', `Failed to migrate ${type}. Undoing all changed on tables...`);
			throw e;
		});
}

export function createAutomaticMaterilizedView<T extends PgMaterializedView>(
	view: T,
	{
		cron,
		db,
		withNoData = false,
		concurrently = true,
		announce = false,
		...scheduleConfig
	}: {
		cron: string;
		db: PostgresJsDatabase<any>;
		concurrently?: boolean;
		withNoData?: boolean;
		announce?: boolean;
	} & ScheduleOptions
): T {
	schedule(
		cron,
		async () => {
			let fn = db.refreshMaterializedView(view);

			if (concurrently) {
				fn = fn.concurrently();
			}

			if (withNoData) {
				fn = fn.withNoData();
			}

			await fn
				.then(() => {
					if (announce) {
						// @ts-ignore
						const { name: tableName } = view[ViewBaseConfig];
						log('drizzle', `Refreshed MAT VIEW ${tableName}`);
					}
				})
				.catch((e: any) => {
					log('error', e.message);
				});
		},
		{ recoverMissedExecutions: true, ...scheduleConfig }
	);

	return view;
}
