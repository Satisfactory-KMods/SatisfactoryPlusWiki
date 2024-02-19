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

export function pgRandom(range?: SQLWrapper | number) {
	if (range) {
		return sql<number>`random() * ${range}`;
	}
	return sql<number>`random()`;
}

export function pgRound(column: SQLWrapper, precision: number = 0) {
	return pgCast(
		sql<any>`round(${column}, ${sql.raw(String(precision))})`,
		precision > 1 ? 'float' : 'integer'
	);
}

export function pgSign<T extends SQLWrapper>(column: T) {
	return pgCast(sql<any>`sign(${column})`, 'integer');
}
