import type { SQL } from 'drizzle-orm';
import { count, sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { PgTable, getTableConfig } from 'drizzle-orm/pg-core';
import type { InferDynamic, InferExtendsTypes } from './types';
import { pgCast } from './utils';

export function pgCountTrue(statement: InferExtendsTypes, noCast = false) {
	if (noCast) {
		return count(sql<number>`CASE WHEN ${statement} THEN 1 END`);
	}
	return pgCast(count(sql<number>`CASE WHEN ${statement} THEN 1 END`), 'integer');
}

export function pgCountFalse(statement: InferExtendsTypes, noCast = false) {
	if (noCast) {
		return count(sql<number>`CASE WHEN ${statement} THEN 1 END`);
	}
	return pgCast(count(sql`CASE WHEN ${statement} THEN NULL ELSE 1 END`), 'integer');
}

export function pgAggTable<T extends Exclude<InferExtendsTypes, SQL | SQL.Aliased>, Idx extends number | undefined = undefined>(
	table: T,
	index?: Idx,
	coalesce = false
): Idx extends number ? SQL<InferDynamic<T>> : SQL<InferDynamic<T>[]> {
	const t = table instanceof PgTable ? sql.raw(getTableConfig(table).name) : table;
	if (typeof index === 'number') {
		return sql<any>`json_agg(${t})->${sql.raw(String(index))}`;
	}
	if (!coalesce) {
		return sql<any>`json_agg(${t})`;
	}
	return sql<any>`COALESCE(json_agg(${t}) FILTER (WHERE ${t} IS NOT NULL), '[]')`;
}

export function pgAggTableFirst<T extends Exclude<InferExtendsTypes, SQL | SQL.Aliased>>(table: T, coalesce = false) {
	return pgAggTable(table, 0, coalesce);
}

export function pgAggTableLast<T extends Exclude<InferExtendsTypes, SQL | SQL.Aliased>>(table: T, coalesce = false) {
	return pgAggTable(table, -1, coalesce);
}

export function pgAggJsonFirstB<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`jsonb_agg(${column})->0`;
}

export function pgAggJsonLastB<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`jsonb_agg(${column})->-1`;
}

export function pgAggJsonArrayB<T extends InferExtendsTypes>(column: T, coalesce = true): SQL<InferDynamic<T>[]> {
	if (!coalesce) {
		return sql<any[]>`jsonb_agg(${column})`;
	}
	return sql<any[]>`COALESCE(jsonb_agg(${column}) FILTER (WHERE ${column} IS NOT NULL), '[]')`;
}

export function pgAggJsonFirst<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`json_agg(${column})->0`;
}

export function pgAggJsonLast<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`json_agg(${column})->-1`;
}

export function pgAggJsonArray<T extends InferExtendsTypes, Idx extends number | undefined = undefined>(
	column: T,
	index?: Idx,
	coalesce = true
): Idx extends number ? SQL<InferDynamic<T>> : SQL<InferDynamic<T>[]> {
	if (typeof index === 'number') {
		return sql<any>`json_agg(${column})->${sql.raw(String(index))}`;
	}
	if (!coalesce) {
		return sql<any>`json_agg(${column})`;
	}
	return sql<any>`COALESCE(json_agg(${column}) FILTER (WHERE ${column} IS NOT NULL), '[]')`;
}

export function pgAggArray<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>[]> {
	return sql<any>`array_agg(${column})`;
}

export function pgAggMin<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`min(${column})`;
}

export function pgAggAvg<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`avg(${column})`;
}

export function pgAggSum<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`sum(${column})`;
}

export function pgAggMax<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`max(${column})`;
}

export function pgAggString<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>[]> {
	return sql<any[]>`string_agg(${column})`;
}

export function pgAggBoolOr<T extends InferExtendsTypes>(column: T) {
	return sql<boolean>`bool_or(${column})`;
}

export function pgAggBoolAnd<T extends InferExtendsTypes>(column: T) {
	return sql<boolean>`bool_and(${column})`;
}

export function pgAggEvery<T extends InferExtendsTypes>(column: T) {
	return sql<boolean>`every(${column})`;
}

export function pgAggBitOr<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`bit_or(${column})`;
}

export function pgAggBitAnd<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`bit_and(${column})`;
}

export function pgAggXmlAgg<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>[]> {
	return sql<any[]>`xmlagg(${column})`;
}

export function pgAggJsonField<T extends PgColumn, Field extends keyof T['_']['data'], Idx extends number | undefined = undefined>(
	column: T,
	field: Field,
	index?: Idx
): Idx extends number ? SQL<T['_']['data'][Field]> : SQL<T['_']['data'][Field][]> {
	if (typeof index === 'number') {
		return sql<any>`json_agg(${column})->${sql.raw(String(index))}->'${sql.raw(String(field))}'`;
	}
	return sql<any>`json_agg(${column})->'${sql.raw(String(field))}'`;
}
