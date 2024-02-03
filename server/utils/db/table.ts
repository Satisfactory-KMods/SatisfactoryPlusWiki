import type { PgCustomColumnBuilder } from 'drizzle-orm/pg-core';
import { customType } from 'drizzle-orm/pg-core';
import moment from 'moment-timezone';

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

export const momentTimestamp = customType<{
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
		return String(value);
	},
	toDriver: (value) => {
		const m = moment.isMoment(value) ? value : moment(value);
		if (!m.isValid()) {
			throw new TypeError(`Invalid timestamp ${value}`);
		}
		return m.toISOString(true);
	}
});

export const momentDate = customType<{
	data: moment.MomentInput;
	driverData: moment.MomentInput;
	config: Record<string, unknown>;
}>({
	dataType: () => {
		return `date`;
	},
	fromDriver: (value) => {
		return String(value);
	},
	toDriver: (value) => {
		const m = moment.isMoment(value) ? value : moment(value);
		if (!m.isValid()) {
			throw new TypeError(`Invalid timestamp ${value}`);
		}
		return m.toISOString(true);
	}
});
