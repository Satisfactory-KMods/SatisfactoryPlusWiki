import crypto from 'crypto';
import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import fs from 'fs';
import type postgres from 'postgres';
import { log } from './../../../utils/logger';

export async function safeMigrate(migrationDb: PostgresJsDatabase<any>, migrationConnection: postgres.Sql<any>, migrationFolderTo: string) {
	await migrate(migrationDb, {
		migrationsFolder: migrationFolderTo
	});

	const migrationQueries = [] as any[];
	const hashes = [] as string[];
	const journalAsString = fs.readFileSync(`${migrationFolderTo}/meta/_journal.json`).toString();
	const journal = JSON.parse(journalAsString);
	for (const journalEntry of journal.entries) {
		const migrationPath = `${migrationFolderTo}/${journalEntry.tag}.sql`;
		try {
			const query = fs.readFileSync(`${migrationFolderTo}/${journalEntry.tag}.sql`).toString();
			const result = query.split('--> statement-breakpoint').map((it) => {
				return it;
			});
			const hash = crypto.createHash('sha256').update(query).digest('hex');
			if (hashes.includes(hash)) {
				throw new Error(`Duplicate hash ${hash} found in ${migrationPath}`);
			}
			hashes.push(hash);
			migrationQueries.push({
				sql: result,
				bps: journalEntry.breakpoints,
				folderMillis: journalEntry.when,
				file: `${migrationFolderTo}/${journalEntry.tag}.sql`,
				hash
			});
		} catch {
			throw new Error(`No file ${migrationPath} found in ${migrationFolderTo} folder`);
		}
	}

	const dbMigrations = await migrationDb.execute<any>(
		sql`select * from "drizzle"."__drizzle_migrations" where hash in ${hashes} order by created_at asc`
	);

	const isHashMigrated = (data: any) => {
		const resultIdx = dbMigrations.findIndex((it) => {
			return it.hash === data.hash;
		});

		if (resultIdx !== -1) return true;

		const startIdx = hashes.findIndex((it) => {
			return it === data.hash;
		});
		const filteredHashes = hashes.slice(startIdx);

		return dbMigrations.some((it) => {
			if (!filteredHashes.includes(it.hash)) return false;
			const fms = parseInt(data.folderMillis);
			const cms = parseInt(it.created_at);

			return fms < cms;
		});
	};

	await migrationDb.transaction(async (tx) => {
		for await (const migration of migrationQueries) {
			if (!isHashMigrated(migration)) {
				log('drizzle', `Migrated ${migration.file} ${migration.hash}`);
				for (const stmt of migration.sql) {
					await tx.execute(sql.raw(stmt));
				}

				await tx.execute(
					sql`insert into "drizzle"."__drizzle_migrations" ("hash", "created_at") values(${migration.hash}, ${migration.folderMillis})`
				);
			} else {
				log('drizzle', `Skipped ${migration.file} ${migration.hash}`);
			}
		}
	});

	await migrationConnection.end();
}
