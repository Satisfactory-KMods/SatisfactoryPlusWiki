/* eslint-disable no-use-before-define */
import type { SQL, Subquery, WithSubquery } from 'drizzle-orm';
import type { PgColumn, PgCustomColumn, PgTable, SubqueryWithSelection, WithSubqueryWithSelection } from 'drizzle-orm/pg-core';

export type InferSubquery<T extends WithSubquery | Subquery> =
	T extends WithSubquery<infer _Z, infer TSelection>
		? {
				[K in keyof TSelection as TSelection[K] extends InferExtendsTypes
					? InferFieldName<TSelection[K], K>
					: K]: TSelection[K] extends InferExtendsTypes ? InferDynamic<TSelection[K]> : TSelection[K];
			}
		: T extends Subquery<infer _Z, infer TSelection>
			? {
					[K in keyof TSelection as TSelection[K] extends InferExtendsTypes
						? InferFieldName<TSelection[K], K>
						: K]: TSelection[K] extends InferExtendsTypes ? InferDynamic<TSelection[K]> : TSelection[K];
				}
			: never;

export type InferExtendsTypesNoTable = PgColumn | PgCustomColumn<any> | SQL | SQL.Aliased;

export type InferExtendsTypes =
	| PgColumn
	| PgCustomColumn<any>
	| PgTable
	| SQL
	| SQL.Aliased
	| WithSubqueryWithSelection<any, any>
	| SubqueryWithSelection<any, any>
	| WithSubquery
	| Subquery;

export type InferFieldName<T extends InferExtendsTypes, Fallback> =
	T extends PgCustomColumn<infer D>
		? D['name']
		: T extends PgColumn
			? T['_']['name']
			: T extends SQL.Aliased
				? Fallback
				: T extends SQL
					? Fallback
					: Fallback;

export type InferDynamic<TDataType extends InferExtendsTypes> = TDataType extends WithSubquery
	? InferSubquery<TDataType>
	: TDataType extends WithSubquery
		? InferSubquery<TDataType>
		: TDataType extends PgTable<infer D>
			? {
					[K in keyof D['columns'] as D['columns'][K] extends InferExtendsTypes
						? InferFieldName<D['columns'][K], K>
						: K]: D['columns'][K] extends InferExtendsTypes ? InferDynamic<D['columns'][K]> : D['columns'][K];
				}
			: TDataType extends PgColumn
				? TDataType['_']['notNull'] extends true
					? TDataType['_']['data']
					: TDataType['_']['hasDefault'] extends true
						? TDataType['_']['data']
						: TDataType['_']['data'] | null
				: TDataType extends SQL.Aliased<infer TData>
					? TData
					: TDataType extends SQL<infer TData>
						? TData
						: never;
