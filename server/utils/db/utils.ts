import type { Query, SQL, SQLWrapper } from 'drizzle-orm';
import { Subquery, sql } from 'drizzle-orm';
import type { PgView } from 'drizzle-orm/pg-core';
import { PgMaterializedView, getMaterializedViewConfig, getViewConfig } from 'drizzle-orm/pg-core';
import type { SelectResultField } from 'drizzle-orm/query-builders/select.types';
import { log } from './../../../utils/logger/index';
import type { InferDynamic } from './types';

export function getColumnsFromViewOrSubquery<T extends PgView | PgMaterializedView | Subquery>(
	view: T
): T extends Subquery<infer _S, infer Fields>
	? Fields
	: T extends PgMaterializedView<infer _S, infer _D, infer Fields>
		? Fields
		: T extends PgView<infer _S, infer _D, infer Fields>
			? Fields
			: unknown {
	if (view instanceof Subquery) {
		// @ts-ignore
		const { selectedFields } = table[SubqueryConfig];
		return selectedFields;
	}

	if (view instanceof PgMaterializedView) {
		const conf = getMaterializedViewConfig(view);
		// @ts-ignore
		return conf.selectedFields;
	}

	const conf = getViewConfig(view);
	// @ts-ignore
	return conf.selectedFields;
}

export function now(): SQL<moment.MomentInput> {
	return sql`now()`;
}

export function pgCaseNumberNull(condition: SQLWrapper, then: number = 0) {
	return sql<number>`case when ${condition} is null then ${sql.raw(String(then))} else ${condition} end`;
}

export function pgCaseNull<T extends SQLWrapper, D extends SQLWrapper = SQL<number>>(
	condition: T,
	then?: D
): SQL<SelectResultField<T> | SelectResultField<D>> {
	return sql<any>`case when ${condition} is null then ${then ?? sql.raw('0')} else ${condition} end`;
}

export function pgCoalesce<T extends InferExtendsTypes>(
	statement: T,
	otherwise: string | SQL = "'[]'::json"
): SQL<InferDynamic<T>> {
	return sql<any>`coalesce(${statement}, ${typeof otherwise === 'string' ? sql.raw(otherwise) : otherwise})`;
}

export function pgCase<T extends InferExtendsTypes, D extends InferExtendsTypes>(
	condition: SQLWrapper,
	then: T,
	otherwise: D
): SQL<InferDynamic<T> | InferDynamic<D>> {
	return sql<any>`case when ${condition} then ${then} else ${otherwise} end`;
}

export type PgCastTypes<T> = {
	'integer': number;
	'bigint': number;
	'float': number;
	'double': number;
	'boolean': boolean;
	'double precision': number;
	'text': string;
	'timestamp': moment.MomentInput;
	'timestamp with time zone': moment.MomentInput;
	'date': moment.MomentInput;
	'time': moment.MomentInput;
	'time with time zone': moment.MomentInput;
	'json': T;
	'jsonb': T;
};

export function pgCast<T extends SQLWrapper, Key extends keyof PgCastTypes<T>>(
	statement: T,
	type: Key
): SQL<PgCastTypes<SelectResultField<T>>[Key]> {
	return sql<any>`cast(${statement} as ${sql.raw(String(type))})`;
}

export function queryToFullSQLString(query: Query, logging = false) {
	const { params } = query;
	let { sql: sqlString } = query;

	params.forEach((x, i) => {
		sqlString = sqlString.replace(`$${i + 1}`, `'${x}'`);
	});

	if (logging) {
		log('drizzle', sqlString);
	}
	return sqlString;
}
