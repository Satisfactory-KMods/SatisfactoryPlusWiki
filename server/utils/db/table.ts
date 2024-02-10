import type { PgCustomColumnBuilder } from 'drizzle-orm/pg-core';
import { customType } from 'drizzle-orm/pg-core';
import moment from 'moment-timezone';
import type { z } from 'zod';

export function safeJsonb<TData = any>() {
	return function <TName extends string>(
		name: TName
	): PgCustomColumnBuilder<{
		name: TName;
		dataType: 'custom';
		columnType: 'PgCustomColumn';
		data: TData;
		driverParam: TData;
		enumValues: undefined;
	}> {
		return customType<{ data: TData; driverData: TData }>({
			dataType() {
				return 'jsonb';
			},
			toDriver(val: TData) {
				return val;
			},
			fromDriver(value): TData {
				if (typeof value === 'string') {
					try {
						return JSON.parse(value) as TData;
					} catch {}
				}
				return value as TData;
			}
		})(name);
	};
}

export function safeJson<TData = any>() {
	return function <TName extends string>(
		name: TName
	): PgCustomColumnBuilder<{
		name: TName;
		dataType: 'custom';
		columnType: 'PgCustomColumn';
		data: TData;
		driverParam: TData;
		enumValues: undefined;
	}> {
		return customType<{ data: TData; driverData: TData }>({
			dataType() {
				return 'json';
			},
			toDriver(val: TData) {
				return val;
			},
			fromDriver(value): TData {
				if (typeof value === 'string') {
					try {
						return JSON.parse(value) as TData;
					} catch {}
				}
				return value as TData;
			}
		})(name);
	};
}

/**
 * small wrapper around json type to use zod schema for validation
 * !NOTE: if you use coerce you get always the input type since
 * !drizzle orm does not support different to set and get types
 */
export function zodJson<TName extends string, TZod extends z.ZodType<any, any, any>>(
	name: TName,
	schema: TZod,
	{
		praseFunction,
		parseFrom
	}: {
		praseFunction?: (val: z.input<TZod>) => z.output<TZod>;
		parseFrom?: boolean;
	} = { parseFrom: true }
): PgCustomColumnBuilder<{
	name: TName;
	dataType: 'custom';
	columnType: 'PgCustomColumn';
	data: z.input<TZod>;
	driverParam: z.input<TZod>;
	enumValues: undefined;
}> {
	return customType<{ data: z.input<TZod>; driverData: z.input<TZod> }>({
		dataType() {
			return 'json';
		},
		toDriver(val) {
			if (praseFunction) {
				return praseFunction(val);
			}
			return schema.parse(val);
		},
		fromDriver(value) {
			if (parseFrom) {
				return schema.parse(value);
			}
			return value;
		}
	})(name);
}

/**
 * A timestamp type that uses moment.js to handle dates and makes the input more flexible
 */
export function momentTimestamp<TName extends string>(
	name: TName,
	{
		keepOffset = false,
		precision,
		withTimezone = true
	}: {
		withTimezone: boolean;
		precision?: number;
		keepOffset?: boolean;
	} = { withTimezone: true, keepOffset: false }
): PgCustomColumnBuilder<{
	name: TName;
	dataType: 'custom';
	columnType: 'PgCustomColumn';
	data: moment.MomentInput;
	driverParam: moment.MomentInput;
	enumValues: undefined;
}> {
	return customType<{
		data: moment.MomentInput;
		driverData: moment.MomentInput;
		config: { withTimezone: boolean; precision?: number };
	}>({
		dataType: (config) => {
			const { withTimezone = true, precision: p } = config ?? {};

			const precision = typeof p !== 'undefined' ? ` (${p})` : '';
			return `timestamp${precision}${withTimezone ? ' with time zone' : ''}`;
		},
		fromDriver: (value) => {
			// we need to format the date to be in the same format as the input
			// otherwise, we get a format like: Mon Feb 05 2024 00:00:00 GMT+0000 (Coordinated Universal Time)
			const m = moment(value);
			if (!m.isValid()) {
				return null;
			}
			return m.toISOString(keepOffset);
		},
		toDriver: (value) => {
			const m = moment.isMoment(value) ? value : moment(value);
			if (!m.isValid()) {
				throw new TypeError(`Invalid timestamp ${value}`);
			}
			return m.toISOString(keepOffset);
		}
	})(name, {
		precision,
		withTimezone
	});
}

/**
 * A date type that uses moment.js to handle dates and makes the input more flexible
 */
export function momentDate<TName extends string>(
	name: TName,
	{
		keepOffset = false,
		formatString = true
	}: {
		keepOffset?: boolean;
		formatString?: true;
	} = {}
): PgCustomColumnBuilder<{
	name: TName;
	dataType: 'custom';
	columnType: 'PgCustomColumn';
	data: moment.MomentInput;
	driverParam: moment.MomentInput;
	enumValues: undefined;
}> {
	return customType<{
		data: moment.MomentInput;
		driverData: moment.MomentInput;

		config: {};
	}>({
		dataType: () => {
			return `date`;
		},
		fromDriver: (value) => {
			// we need to format the date to be in the same format as the input
			// otherwise, we get a format like: Mon Feb 05 2024 00:00:00 GMT+0000 (Coordinated Universal Time)
			const m = moment(value);
			if (!m.isValid()) {
				return null;
			}
			if (!formatString) {
				return m.toISOString(keepOffset);
			}
			return m.format('YYYY-MM-DD');
		},
		toDriver: (value) => {
			const m = moment.isMoment(value) ? value : moment(value);
			if (!m.isValid()) {
				throw new TypeError(`Invalid timestamp ${value}`);
			}
			return m.format('YYYY-MM-DD');
		}
	})(name);
}
