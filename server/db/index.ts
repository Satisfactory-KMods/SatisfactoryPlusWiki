import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { join } from 'path';
import postgres from 'postgres';
import { log } from '~/utils/logger';
import * as schema from './schema';

import { dbCredentials } from '~/env.mjs';

const poolConnection = postgres(dbCredentials);

export const db = drizzle(poolConnection, {
	schema
});

export const dbState = {
	connected: false,
	migrated: false
};

export function startMigrate() {
	log('info', 'Starting database migration');
	if (dbState.migrated) return Promise.resolve(dbState);
	return migrate(db, { migrationsFolder: join(process.cwd(), 'server/db/migrations') })
		.then(() => {
			dbState.migrated = true;
			dbState.connected = true;
			log('info', 'Database migration complete');
			return dbState;
		})
		.catch((err) => {
			log('error', 'Database migration failed', err);
			log('fatal', err.message);
		});
}

export async function startMat() {
	const imports = await import('./mat');
	return migrateMaterialized({
		imports,
		service: 'wiki',
		migrationDb: db
	});
}

export * from './schema';
