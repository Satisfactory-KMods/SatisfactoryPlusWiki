import type { SQL, SQLWrapper } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type { SelectResultField } from 'drizzle-orm/query-builders/select.types';
import { pgCast } from './utils';

export function pgTextLength(column: SQLWrapper) {
	return pgCast(sql`LENGTH(${column})`, 'integer');
}

export function pgUpper(column: SQLWrapper) {
	return sql<string>`UPPER(${column})`;
}

export function pgLower(column: SQLWrapper) {
	return sql<string>`LOWER(${column})`;
}

export function pgInitcap<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`INITCAP(${column})`;
}

export function pgStrLen<T extends SQLWrapper>(column: T) {
	return pgCast(sql`OCTET_LENGTH(${column})`, 'integer');
}

export function pgTrim<T extends SQLWrapper>(column: T) {
	return sql<string>`TRIM(${column})`;
}

export function pgReverse<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`reverse(${column})`;
}
