/* eslint-disable @typescript-eslint/no-var-requires */
import { ViewBaseConfig, sql } from 'drizzle-orm';
import { PgDialect, PgMaterializedView } from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { scheduleJob } from 'node-schedule';
import { log } from '../../../utils/logger';
import { queryToFullSQLString } from './utils';

export interface MaterializedMigration {
	migrationDb: PostgresJsDatabase<any>;
	service: string;
	folder: string;
	logQuerys?: boolean;
}

const matTable = sql.raw('"drizzle"."__materialized_migrations"');

export async function migrateMaterialized({ migrationDb, service, folder, logQuerys = false }: MaterializedMigration) {
	let builders: PgMaterializedView[];
	try {
		const migrations = require(folder);
		builders = Object.values<PgMaterializedView>(migrations).filter((it) => {
			return it instanceof PgMaterializedView;
		});
	} catch (e) {
		log('error', e);
		builders = [];
	}

	log('drizzle', 'Creating materialized view schema and table if not exists');
	await migrationDb.execute<any>(
		sql`
			CREATE SCHEMA IF NOT EXISTS "drizzle";
			CREATE TABLE IF NOT EXISTS ${matTable} (
				tablename varchar(255) not null,
				service varchar(255) not null,
				primary key (tablename)
			);
		`
	);

	const existingTables = await migrationDb.execute<{ table: string; service: string }>(
		sql`select tablename as table, service from ${matTable} where service = ${service}`
	);
	log('drizzle', `Existing ${existingTables.length} mat. tables, to be migrated: ${builders.length}`);

	await migrationDb
		.transaction(async (tx) => {
			const pgDialect = new PgDialect();
			const migratedTables = new Set<string>();

			for (const builder of builders) {
				// @ts-ignore
				const { query, name: tableName, schema } = builder[ViewBaseConfig];
				const queryString = queryToFullSQLString(pgDialect.sqlToQuery(query), logQuerys);

				let schemaString = `${tableName}`;
				if (schema) {
					schemaString = `"${schema}"."${tableName}"`;
				}

				await tx.execute(
					sql`
						INSERT INTO ${matTable} ("tablename", "service") VALUES(${schemaString}, ${service}) ON CONFLICT DO NOTHING;
					`
				);

				await tx.execute(
					sql`
						DROP MATERIALIZED VIEW IF EXISTS ${sql.raw(schemaString)};
						CREATE MATERIALIZED VIEW IF NOT EXISTS ${sql.raw(schemaString)} AS (${sql.raw(queryString)}) WITH DATA;
					`
				);

				migratedTables.add(schemaString);
				log('drizzle', `Migrated ${schemaString}`);
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
						DROP MATERIALIZED VIEW IF EXISTS ${sql.raw(table)};
					`
				);
				log('drizzle', `Deleted ${table}; Reason: not in migration`);
			}
		})
		.catch((e) => {
			log('error', 'Failed to migrate materialized views. Undoing all changed on tables...');
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
		announce = false
	}: {
		cron: string;
		db: PostgresJsDatabase<any>;
		concurrently?: boolean;
		withNoData?: boolean;
		announce?: boolean;
	}
): T {
	scheduleJob(cron, async () => {
		let fn = db.refreshMaterializedView(view);

		if (concurrently) {
			fn = fn.concurrently();
		}

		if (withNoData) {
			fn = fn.withNoData();
		}

		await fn;
		if (announce) {
			// @ts-ignore
			const { name: tableName } = view[ViewBaseConfig];
			log('drizzle', `Refreshed materialized view ${tableName}`);
		}
	});

	return view;
}
