/* eslint-disable no-use-before-define */
import type { SQL, SQLWrapper, Subquery, WithSubquery } from 'drizzle-orm';
import type {
	PgColumn,
	PgCustomColumn,
	PgMaterializedView,
	PgTable,
	PgView,
	SubqueryWithSelection,
	WithSubqueryWithSelection
} from 'drizzle-orm/pg-core';

export type InferSubquery<T extends WithSubquery | Subquery> =
	T extends WithSubquery<infer _Z, infer TSelection>
		? {
				[K in keyof TSelection as TSelection[K] extends InferExtendsTypes
					? InferFieldName<TSelection[K], K>
					: K]: TSelection[K] extends InferExtendsTypes
					? InferDynamic<TSelection[K]>
					: TSelection[K];
			}
		: T extends Subquery<infer _Z, infer TSelection>
			? {
					[K in keyof TSelection as TSelection[K] extends InferExtendsTypes
						? InferFieldName<TSelection[K], K>
						: K]: TSelection[K] extends InferExtendsTypes
						? InferDynamic<TSelection[K]>
						: TSelection[K];
				}
			: never;

export type InferExtendsTypesNoTable = PgColumn | PgCustomColumn<any> | SQL | SQL.Aliased;

export type InferExtendsTypes =
	| PgColumn
	| PgCustomColumn<any>
	| PgTable
	| SQL
	| SQL.Aliased
	| SQLWrapper
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

type ToArray<T, Should extends boolean> = Should extends true ? T[] : T;
type ToInfer<
	T extends
		| {
				[k: string]: InferExtendsTypes;
		  }
		| InferExtendsTypes
> = T extends InferExtendsTypes
	? InferDynamic<T>
	: {
			// @ts-ignore
			[K in keyof T]: InferDynamic<T[K]>;
		};

export type PgAggJsonBuildObjectHelper<
	T extends
		| {
				[k: string]: InferExtendsTypes;
		  }
		| InferExtendsTypes,
	Index extends number | undefined = undefined,
	Aggregate extends boolean = false
> = Index extends number ? SQL<ToArray<ToInfer<T>, false>> : SQL<ToArray<ToInfer<T>, Aggregate>>;

export type InferDynamicRecord<
	T extends {
		[k: string]: InferExtendsTypes;
	}
> = {
	[K in keyof T]: T[K] extends InferExtendsTypes ? InferDynamic<T[K]> : T[K];
};

export type InferView<T extends PgView> =
	T extends PgView<infer _Z, infer _S, infer TSelection>
		? {
				[K in keyof TSelection]: TSelection[K] extends InferExtendsTypes
					? InferDynamic<TSelection[K]>
					: TSelection[K];
			}
		: never;

export type InferMatView<T extends PgMaterializedView> =
	T extends PgMaterializedView<infer _Z, infer _S, infer TSelection>
		? {
				[K in keyof TSelection]: TSelection[K] extends InferExtendsTypes
					? InferDynamic<TSelection[K]>
					: TSelection[K];
			}
		: never;

export type InferDynamic<TDataType extends InferExtendsTypes> = TDataType extends PgMaterializedView
	? InferMatView<TDataType>
	: TDataType extends PgView
		? InferView<TDataType>
		: TDataType extends WithSubquery
			? InferSubquery<TDataType>
			: TDataType extends WithSubquery
				? InferSubquery<TDataType>
				: TDataType extends PgTable<infer D>
					? {
							[K in keyof D['columns'] as D['columns'][K] extends InferExtendsTypes
								? InferFieldName<D['columns'][K], K>
								: K]: D['columns'][K] extends InferExtendsTypes
								? InferDynamic<D['columns'][K]>
								: D['columns'][K];
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
