import type { SQL } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import type { InferExtendsTypes } from './types';
import { pgCast } from './utils';

export function pgJsonField<T extends PgColumn, Field extends keyof T['_']['data']>(column: T, field: Field): SQL<T['_']['data'][Field]> {
	return sql<any>`${column}::json->'${sql.raw(String(field))}'`;
}

export function pgFirstJsonField<T extends PgColumn, Field extends keyof T['_']['data']>(column: T, field: Field): SQL<T['_']['data'][Field]> {
	return sql<any>`json_agg(${column})->0->'${sql.raw(String(field))}'`;
}

export function pgLastJsonField<T extends PgColumn, Field extends keyof T['_']['data']>(column: T, field: Field): SQL<T['_']['data'][Field]> {
	return sql<any>`json_agg(${column})->-1->'${sql.raw(String(field))}'`;
}

/**
 * this is a bit of a hack, but it works for now
 * it will break if you try to access a nested array field field
 */
export function pgJsonNestedField<T = unknown>(column: InferExtendsTypes, fields: string[]) {
	if (fields.length === 0) {
		throw new Error('fields cannot be empty');
	}
	const firstField = fields.at(0)!;
	const restFields = fields.slice(1);
	const baseQuery = sql<T>`${column}::json->'${sql.raw(String(firstField))}'`;
	if (restFields.length) {
		return restFields.reduce((query, field) => {
			return sql<T>`${pgCast(query, 'json')}->'${sql.raw(String(field))}'`;
		}, baseQuery);
	}
	return baseQuery;
}

/**
 * this is a bit of a hack, but it works for now
 * it will break if you try to access a nested array field field
 */
export function pgJsonArrayNestedField<T = unknown>(column: InferExtendsTypes, fields: string[], index: number = -1) {
	if (fields.length === 0) {
		throw new Error('fields cannot be empty');
	}
	const firstField = fields.at(0)!;
	const restFields = fields.slice(1);
	const baseQuery = sql<T>`${column}::json->-${sql.raw(String(index))}->>'${sql.raw(String(firstField))}'`;
	if (restFields.length) {
		return restFields.reduce((query, field) => {
			return sql<T>`${pgCast(query, 'json')}->'${sql.raw(String(field))}'`;
		}, baseQuery);
	}
	return baseQuery;
}
