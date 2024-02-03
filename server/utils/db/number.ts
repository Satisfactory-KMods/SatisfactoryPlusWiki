import type { SQL } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type { InferDynamic, InferExtendsTypes } from './types';

export function pgTrunc<T extends InferExtendsTypes>(column: T): SQL<string> {
	return sql<any>`trunc(${column})`;
}

export function pgMd5<T extends InferExtendsTypes>(column: T): SQL<string> {
	return sql<any>`md5(${column})`;
}

export function pgSqrl<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`sqrt(${column})`;
}

export function pgFloor<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`floor(${column})`;
}

export function pgCeil<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`ceil(${column})`;
}

export function pgAbs<T extends InferExtendsTypes>(column: T): SQL<InferDynamic<T>> {
	return sql<any>`abs(${column})`;
}
