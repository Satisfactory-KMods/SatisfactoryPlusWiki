import { relations } from 'drizzle-orm';
import { integer, json, numeric, text, uuid } from 'drizzle-orm/pg-core';
import type { SFNodeCoords, SFResourceNodeType } from '~/utils/satisfactoryExtractorTypes';
import { items } from './items';
import { dbSchema, resourceNodeType } from './schema';

export const mapTable = dbSchema.table('map', {
	id: uuid('id').defaultRandom().primaryKey(),
	itemPath: text('item_path').references(
		() => {
			return items.path;
		},
		{
			onDelete: 'cascade'
		}
	),
	noRelItemPath: text('raw_item_path').notNull(),
	type: resourceNodeType('type').$type<SFResourceNodeType>().notNull(),
	x: numeric('x').notNull(),
	y: numeric('y').notNull(),
	z: numeric('z').notNull(),
	purity: integer('purity').$type<SFNodeCoords['purity']>().notNull(),
	itemAmounts: json('item_amounts').$type<SFNodeCoords['itemAmounts']>().notNull(),
	satelites: json('satelites').$type<SFNodeCoords['satelites']>().notNull()
});

export const mapTableRelations = relations(mapTable, ({ one }) => {
	return {
		item: one(items, {
			fields: [mapTable.itemPath],
			references: [items.path]
		})
	};
});