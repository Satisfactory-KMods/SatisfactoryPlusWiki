import type { SQLWrapper } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { pgCast } from './utils';

export function pgTrunc<T extends SQLWrapper>(column: T) {
	return pgCast(sql`trunc(${column})`, 'integer');
}

export function pgMd5<T extends SQLWrapper>(column: T) {
	return sql<string>`md5(${column})`;
}

export function pgSqrl<T extends SQLWrapper>(column: T) {
	return pgCast(sql<any>`sqrt(${column})`, 'float');
}

export function pgFloor<T extends SQLWrapper>(column: T) {
	return pgCast(sql<any>`floor(${column})`, 'float');
}

export function pgCeil<T extends SQLWrapper>(column: T) {
	return pgCast(sql<any>`ceil(${column})`, 'integer');
}

export function pgAbs<T extends SQLWrapper>(column: T) {
	return pgCast(sql<any>`abs(${column})`, 'float');
}
