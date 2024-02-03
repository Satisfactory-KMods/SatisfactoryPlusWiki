import type { Query, SQL } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type moment from 'moment-timezone';
import { log } from '../../../utils/logger';

export function now() {
	return sql`now()`;
}

export function pgCaseNumberNull<T>(condition: SQL<T>, then: number = 0): SQL<T> {
	return sql<T>`case when ${condition} is null then ${sql.raw(String(then))} else ${condition} end`;
}

export function pgCaseNull<T>(condition: SQL<T>, then: string = '0'): SQL<T> {
	return sql<T>`case when ${condition} is null then ${sql.raw(then)} else ${condition} end`;
}

export function pgCase<T>(condition: SQL, then: SQL, otherwise: SQL): SQL<T> {
	return sql<T>`case when ${condition} then ${then} else ${otherwise} end`;
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

export function pgCast<T, Key extends keyof PgCastTypes<T>>(statement: SQL<T>, type: Key): SQL<PgCastTypes<T>[Key]> {
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
