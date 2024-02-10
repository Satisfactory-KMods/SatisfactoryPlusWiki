import type { SQLWrapper } from 'drizzle-orm';
import { SQL, Subquery, SubqueryConfig, count, sql } from 'drizzle-orm';
import { PgColumn, PgMaterializedView, PgTable, PgView, getMaterializedViewConfig, getTableConfig, getViewConfig } from 'drizzle-orm/pg-core';
import type { SelectResultField } from 'drizzle-orm/query-builders/select.types';
import type { InferDynamic, InferExtendsTypes, InferExtendsTypesNoTable } from './types';
import { pgCast } from './utils';

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

/**
 * @deprecated use pgAggJsonBuildObject instead
 */
export function pgAggTableFirst<T extends Exclude<InferExtendsTypes, SQL | SQL.Aliased>>(table: T, coalesce = false) {
	return pgAggTable(table, 0, coalesce);
}

/**
 * @deprecated use pgAggJsonBuildObject instead
 */
export function pgAggTableLast<T extends Exclude<InferExtendsTypes, SQL | SQL.Aliased>>(table: T, coalesce = false) {
	return pgAggTable(table, -1, coalesce);
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

export function pgAggMin<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`min(${column})`;
}

export function pgAggAvg<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`avg(${column})`;
}

export function pgAggSum<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`sum(${column})`;
}

export function pgAggMax<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
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

export function pgAggBitOr<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
	return sql<any>`bit_or(${column})`;
}

export function pgAggBitAnd<T extends SQLWrapper>(column: T): SQL<SelectResultField<T>> {
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

export function pgAggJsonBuildObject<
	T extends
		| {
				[k: string]: InferExtendsTypes;
		  }
		| InferExtendsTypes,
	Index extends number | undefined = undefined
>(
	table: T,
	index?: Index,
	coalesce = true
): Index extends number
	? SQL<
			T extends InferExtendsTypes
				? InferDynamic<T>
				: {
						// @ts-ignore
						[K in keyof T]: InferDynamic<T[K]>;
					}
		>[]
	: SQL<
			T extends InferExtendsTypes
				? InferDynamic<T>
				: {
						// @ts-ignore
						[K in keyof T]: InferDynamic<T[K]>;
					}
		> {
	const datas: Record<string, any> = {};

	// !Experimental
	if (table instanceof Subquery) {
		// @ts-ignore
		const { selectedFields } = table[SubqueryConfig];
		for (const [k, v] of Object.entries(selectedFields)) {
			datas[k] = v;
		}
	} else if (table instanceof PgTable) {
		const conf = getTableConfig(table);
		for (const v of Object.values(conf.columns)) {
			datas[v.name] = v;
		}
	} else if (table instanceof PgMaterializedView) {
		const conf = getMaterializedViewConfig(table);
		for (const [k, v] of Object.entries(conf.selectedFields)) {
			datas[k] = v;
		}
	} else if (table instanceof PgView) {
		const conf = getViewConfig(table);
		for (const [k, v] of Object.entries(conf.selectedFields)) {
			datas[k] = v;
		}
	} else if (!(table instanceof PgColumn)) {
		for (const [k, v] of Object.entries(table)) {
			datas[k] = v;
		}
	}

	const ent = Object.entries(datas);
	if (!ent.length) {
		if (table instanceof PgColumn || table instanceof SQL) {
			const query = coalesce ? sql`coalesce(json_agg(json_build_object(${table})), '[]'::json)` : sql`json_agg(json_build_array(${table}))`;

			return (typeof index !== 'undefined' ? sql.join([query, sql`->${sql.raw(String(index))}`], sql``) : query) as any;
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

	const query = coalesce ? sql`coalesce(json_build_object(${joinedSql}), '[]'::json)` : sql`json_build_array(${joinedSql})`;
	return (typeof index !== 'undefined' ? sql.join([query, sql`->${sql.raw(String(index))}`], sql``) : query) as any;
}

export function pgAggJsonBuildArray<
	T extends InferExtendsTypesNoTable | InferExtendsTypesNoTable[],
	Index extends number | undefined = undefined,
	Flat extends boolean = false
>(
	table: T,
	index?: Index,
	flatten?: Flat,
	coalesce = true
): Index extends number
	? T extends InferExtendsTypesNoTable
		? SQL<Flat extends true ? InferDynamic<T> : InferDynamic<T>[]>
		: SQL<Flat extends true ? any : any[]>
	: T extends InferExtendsTypesNoTable
		? SQL<Flat extends true ? InferDynamic<T>[] : InferDynamic<T>[][]>
		: SQL<Flat extends true ? any[] : any[][]> {
	const flat = sql.raw(!flatten ? '' : '->>0');

	const ent = table instanceof Array ? table : [table];
	if (!ent.length) {
		throw new TypeError('No columns to aggregate');
	}

	const joinedSql = sql.join(
		(table instanceof Array ? table : [table]).map((e) => {
			return sql`${e}`;
		}),
		sql`, `
	);

	const query = coalesce
		? sql`coalesce(json_agg(json_build_array(${joinedSql})${flat}), '[]'::json)`
		: sql`json_agg(json_build_array(${joinedSql})${flat})`;

	return (typeof index !== 'undefined' ? sql.join([query, sql`->${sql.raw(String(index))}`], sql``) : query) as any;
}

export function pgAggCount(expression?: SQLWrapper) {
	return pgCast(count(expression), 'integer');
}
