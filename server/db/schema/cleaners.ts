import { relations } from 'drizzle-orm';
import { boolean, integer, numeric, text, unique, uuid } from 'drizzle-orm/pg-core';
import type { SFDataType } from '~/utils/satisfactoryExtractorTypes';
import { items } from './items';
import { dataTypeEnum, dbSchema } from './schema';
import { schematics } from './schematics';

// -----------------------------------------------------
// cleaner
// -----------------------------------------------------
export const cleaner = dbSchema.table('cleaner', {
	path: text('path').notNull().primaryKey(),
	image: text('image').notNull(),
	name: text('name').notNull(),
	dataType: dataTypeEnum('data_type').$type<SFDataType>().notNull(),
	description: text('description').notNull(),
	schematic: text('schematic')
		.notNull()
		.references(
			() => {
				return schematics.path;
			},
			{
				onDelete: 'cascade'
			}
		),
	inFluid: text('in_fluid')
		.notNull()
		.references(
			() => {
				return items.path;
			},
			{
				onDelete: 'cascade'
			}
		),
	outFluid: text('out_fluid').references(
		() => {
			return items.path;
		},
		{
			onDelete: 'cascade'
		}
	),
	inAmount: integer('in_amount').notNull(),
	outAmount: integer('out_amount').notNull(),
	filterItem: text('filter_item')
		.notNull()
		.references(
			() => {
				return items.path;
			},
			{
				onDelete: 'cascade'
			}
		),
	filterNeed: boolean('filter_need').notNull(),
	filterTime: numeric('filter_time').notNull(),
	filterAmount: integer('filter_amount').notNull()
});

export const cleanerRelations = relations(cleaner, ({ many, one }) => {
	return {
		schematicData: one(schematics, {
			fields: [cleaner.schematic],
			references: [schematics.path]
		}),
		inFluidData: one(items, {
			fields: [cleaner.inFluid],
			references: [items.path]
		}),
		filterItemData: one(items, {
			fields: [cleaner.filterItem],
			references: [items.path]
		}),
		outFluidData: one(items, {
			fields: [cleaner.outFluid],
			references: [items.path]
		}),
		byPass: many(cleanerByPass)
	};
});

// -----------------------------------------------------
// bypass cleaner
// -----------------------------------------------------

export const cleanerByPass = dbSchema.table(
	'cleaner_bypass',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		cleanerPath: text('cleaner_path')
			.notNull()
			.references(
				() => {
					return cleaner.path;
				},
				{
					onDelete: 'cascade'
				}
			),
		itemPath: text('item_path')
			.notNull()
			.references(
				() => {
					return items.path;
				},
				{
					onDelete: 'cascade'
				}
			),
		time: numeric('time').notNull(),
		amount: integer('amount').notNull()
	},
	(t) => {
		return {
			unq: unique().on(t.cleanerPath, t.itemPath)
		};
	}
);

export const cleanerByPassRelations = relations(cleanerByPass, ({ one }) => {
	return {
		cleaner: one(cleaner, {
			fields: [cleanerByPass.cleanerPath],
			references: [cleaner.path]
		}),
		item: one(items, {
			fields: [cleanerByPass.itemPath],
			references: [items.path]
		})
	};
});
