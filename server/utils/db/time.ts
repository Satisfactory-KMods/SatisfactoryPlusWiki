import { sql } from 'drizzle-orm';
import type { InferExtendsTypes } from './types';
import { pgCast } from './utils';

export function pgWeekNumber(column: InferExtendsTypes) {
	return pgCast(sql`DATE_PART('week', ${column})`, 'integer');
}
