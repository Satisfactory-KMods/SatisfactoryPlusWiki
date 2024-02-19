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

export function pgRepease(column: SQLWrapper, count: number) {
	return sql<string>`REPEAT(${column}, ${pgCast(sql.raw(String(count)), 'integer')})`;
}

export function pgAscii(target: SQLWrapper, encoding?: string | number) {
	if (encoding) {
		return sql<string>`ascii(${target}, ${encoding})`;
	}
	return sql<string>`to_ascii(${target})`;
}

export function pgSubstr(target: SQLWrapper, from: number, to?: number) {
	if (typeof to === 'number') {
		return sql<string>`substr(${target}, ${from}, ${to})`;
	}
	return sql<string>`substr(${target}, ${from})`;
}

export function pgReplace(target: SQLWrapper, replaceWith: SQLWrapper | string | number) {
	return sql<string>`replace(${target}, ${replaceWith})`;
}

export function pgToHex(target: SQLWrapper) {
	return sql<string>`to_hex(${target})`;
}

export function pgUnistr(target: SQLWrapper) {
	return sql<string>`unistr(${target})`;
}

export function pgChr(char: number) {
	if (!Number.isInteger(char)) {
		throw new TypeError('Invalid character code');
	}
	return sql<string>`chr(${sql.raw(String(char))})`;
}

export function pgStrConcat(main: SQLWrapper[], ...target: SQLWrapper[]) {
	return sql<string>`concat(${main}, ${sql.join(target, sql`, `)})`;
}

export function pgRPad(target: SQLWrapper, length: number, pad: SQLWrapper | string) {
	return sql<string>`rpad(${target}, ${length}, ${pad})`;
}

export function pgLPad(target: SQLWrapper, length: number, pad: SQLWrapper | string) {
	return sql<string>`lpad(${target}, ${length}, ${pad})`;
}

export function pgLTrim(target: SQLWrapper, trim?: SQLWrapper | string) {
	if(!trim) {
		return sql<string>`ltrim(${target})`;
	}
	return sql<string>`ltrim(${target}, ${trim})`;
}

export function pgRTrim(target: SQLWrapper, trim?: SQLWrapper | string) {
	if(!trim) {
		return sql<string>`rtrim(${target})`;
	}
	return sql<string>`rtrim(${target}, ${trim})`;
}
