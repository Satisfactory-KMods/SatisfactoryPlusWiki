import { relations } from 'drizzle-orm';
import { boolean, integer, numeric, text, uuid, varchar } from 'drizzle-orm/pg-core';
import type { SFDataType, SFDescType, SFItemForm } from '~/utils/satisfactoryExtractorTypes';
import { dataTypeEnum, dbSchema, descriptorType, itemFormEnum } from './schema';
import { schematics } from './schematics';
import { wikiElement } from './wiki';

export const buildables = dbSchema.table('buildables', {
	id: uuid('id').defaultRandom().primaryKey(),
	path: text('path').notNull().unique(),
	buildingPath: text('building_path').notNull().unique(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	image: text('image').notNull(),
	isVehicle: boolean('is_vehicle').notNull(),
	isCleaner: boolean('is_cleaner').notNull(),
	isMiner: boolean('is_miner').notNull(),
	isModul: boolean('is_modul').notNull(),
	isHatchery: boolean('is_hatchery').notNull(),
	isHatcheryModul: boolean('is_hatchery_modul').notNull(),
	powerConsume: numeric('power_consume').notNull(),
	descriptorType: descriptorType('descriptor_type').$type<SFDescType>().notNull(),
	gasColor: varchar('gas_color', { length: 8 }).notNull(),
	fluidColor: varchar('fluid_color', { length: 8 }).notNull(),
	radio: numeric('radio').notNull(),
	radioActive: boolean('radio_active').notNull(),
	canDelete: boolean('can_delete').notNull(),
	energyValue: numeric('energy_value').notNull(),
	stackSize: integer('stack_size').notNull(),
	category: text('category').notNull(),
	subCategory: text('sub_category').notNull(),
	form: itemFormEnum('form').$type<SFItemForm>().notNull(),
	dataType: dataTypeEnum('data_type').$type<SFDataType>().notNull()
});

export type BuildableInsert = typeof buildables.$inferInsert;
export type BuildableSelect = typeof buildables.$inferSelect;

export const buildablesRelations = relations(buildables, ({ many, one }) => {
	return {
		schematics: many(schematics),
		recipes: many(buildables),
		wikiEl: one(wikiElement, {
			fields: [buildables.id],
			references: [wikiElement.elPath]
		})
	};
});
