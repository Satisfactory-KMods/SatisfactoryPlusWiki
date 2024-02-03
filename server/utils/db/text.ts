import type { SQL } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type { InferDynamic, InferExtendsTypes } from './types';
import { pgCast } from './utils';

export function pgTextLength(column: InferExtendsTypes) {
	return pgCast(sql`LENGTH(${column})`, 'integer');
}

export function pgUpper(column: InferExtendsTypes) {
	return sql<string>`UPPER(${column})`;
}

export function pgLower(column: InferExtendsTypes) {
	return sql<string>`LOWER(${column})`;
}

export function pgInitcap<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`INITCAP(${column})`;
}

export function pgStrLen<T extends InferExtendsTypes>(column: T) {
	return sql<string>`OCTET_LENGTH(${column})`;
}

export function pgTrim<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`TRIM(${column})`;
}

export function pgReverse<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`reverse(${column})`;
}
