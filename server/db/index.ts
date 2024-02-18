import * as mats from './mat';
import { db } from './pg';
import * as imports from './views';

export function startMat() {
	return migrateMaterialized({
		imports: mats,
		service: 'wiki',
		migrationDb: db
	});
}

export function startView() {
	return migrateMaterialized({
		imports,
		service: 'wiki',
		migrationDb: db,
		type: 'VIEW'
	});
}

export * from './pg';
