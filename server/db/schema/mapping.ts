import { text, uuid } from 'drizzle-orm/pg-core';
import type { SFDataType } from '~/utils/satisfactoryExtractorTypes';
import { dbSchema } from './schema';

export const mapping = dbSchema.table('mapping', {
	id: uuid('id').defaultRandom().primaryKey(),
	dataId: text('data_id').unique().notNull(),
	shortPath: text('short_path').unique().notNull(),
	displayName: text('display_name').notNull(),
	elPath: text('el_path').notNull(),
	type: text('type').$type<SFDataType>().notNull()
});
