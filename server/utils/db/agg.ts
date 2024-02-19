import type { SQLWrapper } from 'drizzle-orm';
import { SQL, Subquery, count, sql } from 'drizzle-orm';
import { PgColumn, PgMaterializedView, PgTable, PgView, getTableConfig } from 'drizzle-orm/pg-core';
import type { SelectResultField } from 'drizzle-orm/query-builders/select.types';
import type { InferDynamic, InferExtendsTypes, PgAggJsonBuildObjectHelper } from './types';
import { getColumnsFromViewOrSubquery, pgCast } from './utils';

export function pgCountTrue(statement: SQLWrapper, noCast = false) {
	if (noCast) {
		return count(sql<number>`CASE WHEN ${statement} THEN 1 END`);
	}
	return pgCast(count(sql<number>`CASE WHEN ${statement} THEN 1 END`), 'integer');
}

export function pgCountFalse(statement: SQLWrapper, noCast = false) {
	if (noCast) {
		return count(sql<number>`CASE WHEN ${statement} THEN 1 END`);
	}
	return pgCast(count(sql`CASE WHEN ${statement} THEN NULL ELSE 1 END`), 'integer');
}

/**
 * @deprecated use pgAggJsonBuildObject instead
 */
export function pgTable<
	T extends Exclude<InferExtendsTypes, SQL | SQL.Aliased>,
	Idx extends number | undefined = undefined
>(
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

/**
 * @deprecated use pgAggJsonBuildObject instead
 */
export function pgTableFirst<T extends Exclude<InferExtendsTypes, SQL | SQL.Aliased>>(
	table: T,
	coalesce = false
) {
	return pgTable(table, 0, coalesce);
}

/**
 * @deprecated use pgAggJsonBuildObject instead
 */
export function pgTableLast<T extends Exclude<InferExtendsTypes, SQL | SQL.Aliased>>(
	table: T,
	coalesce = false
) {
	return pgTable(table, -1, coalesce);
}

export function pgJsonAggFirst<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`json_agg(${column})->0`;
}

export function pgJsonAggLast<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`json_agg(${column})->-1`;
}

export function pgJsonAggCoal<
	T extends InferExtendsTypes,
	Idx extends number | undefined = undefined
>(
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

export function pgArrayAgg<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>[]> {
	return sql<any>`array_agg(${column})`;
}

export function pgMin<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`min(${column})`;
}

export function pgAvg<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`avg(${column})`;
}

export function pgSum<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`sum(${column})`;
}

export function pgMax<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`max(${column})`;
}

export function pgStringAgg<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>[]> {
	return sql<any[]>`string_agg(${column})`;
}

export function pgBoolOr<T extends InferExtendsTypes>(column: T) {
	return sql<boolean>`bool_or(${column})`;
}

export function pgBoolAnd<T extends InferExtendsTypes>(column: T) {
	return sql<boolean>`bool_and(${column})`;
}

export function pgEvery<T extends InferExtendsTypes>(column: T) {
	return sql<boolean>`every(${column})`;
}

export function pgBitOr<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`bit_or(${column})`;
}

export function pgBitAnd<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`bit_and(${column})`;
}

export function pgXmlAgg<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>[]> {
	return sql<any[]>`xmlagg(${column})`;
}

export function pgJsonAggField<
	T extends PgColumn,
	Field extends keyof T['_']['data'],
	Idx extends number | undefined = undefined
>(
	column: T,
	field: Field,
	index?: Idx
): Idx extends number ? SQL<T['_']['data'][Field]> : SQL<T['_']['data'][Field][]> {
	if (typeof index === 'number') {
		return sql<any>`json_agg(${column})->${sql.raw(String(index))}->'${sql.raw(String(field))}'`;
	}
	return sql<any>`json_agg(${column})->'${sql.raw(String(field))}'`;
}

export function pgAggJsonBuildObject<
	T extends
		| {
				[k: string]: InferExtendsTypes;
		  }
		| InferExtendsTypes,
	Index extends number | undefined = undefined,
	Aggregate extends boolean = false
>(
	table: T,
	{
		index = undefined,
		aggregate = undefined,
		coalesce = true
	}: {
		index?: Index;
		aggregate?: Aggregate;
		coalesce?: boolean;
	} = {}
): PgAggJsonBuildObjectHelper<T, Index, Aggregate> {
	let datas: Record<string, any> = {};

	// !Experimental
	if (
		table instanceof PgView ||
		table instanceof Subquery ||
		table instanceof PgMaterializedView
	) {
		datas = {
			...datas,
			...getColumnsFromViewOrSubquery(table)
		};
	} else if (table instanceof PgTable) {
		const conf = getTableConfig(table);
		for (const v of Object.values(conf.columns)) {
			datas[v.name] = v;
		}
	} else if (!(table instanceof PgColumn)) {
		for (const [k, v] of Object.entries(table)) {
			datas[k] = v;
		}
	}

	const ent = Object.entries(datas);
	if (!ent.length) {
		if (table instanceof PgColumn || table instanceof SQL) {
			const query = coalesce
				? pgCoalesce(pgJsonAgg(sql`json_build_object(${table})`))
				: pgJsonAgg(sql`json_build_object(${table})`);

			return (
				typeof index !== 'undefined'
					? sql.join([query, sql`->${sql.raw(String(index))}`], sql``)
					: query
			) as any;
		}

		throw new TypeError('No columns to aggregate');
	}

	const joinedSql = sql.join(
		ent.reduce<SQL[]>((cur, [k, v]) => {
			cur.push(sql.raw(`'${k}'`), v as any);
			return cur;
		}, []),
		sql`, `
	);

	if (aggregate) {
		const query = coalesce
			? pgCoalesce(pgJsonAgg(sql`json_build_object(${joinedSql})`))
			: pgJsonAgg(sql`json_build_object(${joinedSql})`);
		return (
			typeof index !== 'undefined'
				? sql.join([query, sql`->${sql.raw(String(index))}`], sql``)
				: query
		) as any;
	}

	const query = coalesce
		? pgCoalesce(sql`json_build_object(${joinedSql})`, pgNull())
		: sql`json_build_object(${joinedSql})`;
	return (
		typeof index !== 'undefined'
			? sql.join([query, sql`->${sql.raw(String(index))}`], sql``)
			: query
	) as any;
}

export function pgNull() {
	return sql<null>`NULL`;
}

export function pgJsonAgg<T extends SQLWrapper>(expression?: T): SQL<SelectResultField<T>[]> {
	return sql`json_agg(${expression})`;
}

export function pgCastCount(expression?: SQLWrapper) {
	return pgCast(count(expression), 'integer');
}

export function pgNullIf<T extends SQLWrapper>(
	v1: T,
	v2: SQLWrapper
): SQL<SelectResultField<T> | null> {
	return sql`NULLIF(${v1}, ${v2})`;
}

export function pgAnyValue<T extends SQLWrapper>(expression: T): SQL<SelectResultField<T>> {
	return sql`any_value(${expression})`;
}
