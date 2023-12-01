import { relations } from 'drizzle-orm';
import { boolean, integer, json, numeric, text, varchar } from 'drizzle-orm/pg-core';
import type { SFDataItemType, SFDataType, SFDescType, SFItemForm } from '~/utils/satisfactoryExtractorTypes';
import { cleaner } from './cleaners';
import { mapTable } from './map';
import { recipes } from './recipes';
import { dataTypeEnum, dbSchema, descriptorType, itemFormEnum } from './schema';
import { schematics } from './schematics';

export const items = dbSchema.table('items', {
	path: text('path').notNull().primaryKey(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	gasColor: varchar('gas_color', { length: 8 }).notNull(),
	fluidColor: varchar('fluid_color', { length: 8 }).notNull(),
	canBeSink: boolean('can_be_sink').notNull(),
	sinkPoints: numeric('sink_points').notNull(),
	radio: numeric('radio').notNull(),
	radioActive: boolean('radio_active').notNull(),
	descriptorType: descriptorType('descriptor_type').$type<SFDescType>().notNull(),
	canDelete: boolean('can_delete').notNull(),
	energyValue: numeric('energy_value').notNull(),
	form: itemFormEnum('form').$type<SFItemForm>().notNull(),
	stackSize: integer('stack_size').notNull(),
	itemTypeInformation: json('item_type_information').$type<SFDataItemType>().notNull(),
	image: text('image').notNull(),
	category: text('category').notNull(),
	subCategory: text('subCategory').notNull(),
	dataType: dataTypeEnum('data_type').$type<SFDataType>().notNull()
});

export const itemsRelations = relations(items, ({ many }) => {
	return {
		schematics: many(schematics),
		recipes: many(recipes),
		cleaners: many(cleaner),
		mapLocations: many(mapTable)
	};
});
