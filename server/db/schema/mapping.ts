import { text, uuid } from 'drizzle-orm/pg-core';
import type { SFDataType } from '~/utils/satisfactoryExtractorTypes';
import { dbSchema } from './schema';

export const mapping = dbSchema.table('mapping', {
	id: uuid('id').defaultRandom().primaryKey(),
	dataId: text('data_id').unique(),
	shortPath: text('short_path').unique(),
	displayName: text('display_name'),
	elPath: text('el_path'),
	type: text('type').$type<SFDataType>().notNull()
});
