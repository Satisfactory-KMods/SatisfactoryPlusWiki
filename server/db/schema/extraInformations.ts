import { colJson } from '@kmods/drizzle-orm-utils';
import { relations } from 'drizzle-orm';
import { boolean, text, uuid } from 'drizzle-orm/pg-core';
import type { SFInformationRow } from '~/utils/satisfactoryExtractorTypes';
import { buildables } from './buildables';
import { items } from './items';
import { dbSchema } from './schema';

export const extraInformations = dbSchema.table('extra_informations', {
	id: uuid('id').defaultRandom().primaryKey(),
	buildablePath: text('buildable_path')
		.unique()
		.references(
			() => {
				return buildables.path;
			},
			{ onDelete: 'cascade' }
		),
	itemPath: text('item_path')
		.unique()
		.references(
			() => {
				return items.path;
			},
			{ onDelete: 'cascade' }
		),
	name: text('name').notNull(),
	isVehicle: boolean('is_vehicle').default(false).notNull(),
	isCleaner: boolean('is_cleaner').default(false).notNull(),
	isMiner: boolean('is_miner').default(false).notNull(),
	isModul: boolean('is_modul').default(false).notNull(),
	isHatchery: boolean('is_hatchery').default(false).notNull(),
	isHatcheryModul: boolean('is_hatchery_modul').default(false).notNull(),
	consumed: colJson('consumed_in').$type<SFInformationRow[]>().notNull().defaultArray(),
	produced: colJson('produced_in').$type<SFInformationRow[]>().notNull().defaultArray()
});

export const extraInformationsRelations = relations(extraInformations, ({ one }) => {
	return {
		buildable: one(buildables, {
			fields: [extraInformations.buildablePath],
			references: [buildables.path]
		}),
		item: one(items, {
			fields: [extraInformations.itemPath],
			references: [items.path]
		})
	};
});
