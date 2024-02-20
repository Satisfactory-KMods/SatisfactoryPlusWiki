import { migrateViews } from '@kmods/drizzle-orm-utils';
import * as mats from './mat';
import { db } from './pg';
import * as imports from './views';

export function startMat() {
	return migrateViews({
		imports: {
			...imports,
			...mats
		},
		service: 'wiki',
		migrationDb: db
	});
}

export * from './pg';
