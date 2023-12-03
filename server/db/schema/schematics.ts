import { relations } from 'drizzle-orm';
import { index, integer, numeric, text, unique, uuid } from 'drizzle-orm/pg-core';
import type { SFDataType, SFSchematicType } from '~/utils/satisfactoryExtractorTypes';
import { cleaner } from './cleaners';
import { items } from './items';
import { recipes } from './recipes';
import { dataTypeEnum, dbSchema, schematicType } from './schema';
import { wikiElement } from './wiki';

// -----------------------------------------------------
// schematics
// -----------------------------------------------------
export const schematics = dbSchema.table(
	'schematics',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		path: text('path').notNull().unique(),
		name: text('name').notNull(),
		description: text('description').notNull(),
		image: text('image').notNull(),
		smallImage: text('small_image').notNull(),
		category: text('category').notNull(),
		subCategory: text('sub_category').notNull(),
		type: schematicType('type').$type<SFSchematicType>().notNull(),
		tier: integer('tier').notNull(),
		time: numeric('time').notNull(),
		handSlots: integer('hand_slots').notNull(),
		inventorySlots: integer('inventory_slots').notNull(),
		dataType: dataTypeEnum('data_type').$type<SFDataType>().notNull()
	},
	(t) => {
		return {
			pathIdx: index('name_idx').on(t.path)
		};
	}
);

export type SchematicInsert = typeof schematics.$inferInsert;
export type SchematicSelect = typeof schematics.$inferSelect;

export const schematicsRelations = relations(schematics, ({ many, one }) => {
	return {
		schematics: many(schematics),
		recipeUnlocks: many(recipes),
		subSchematics: many(schematics),
		scannerUnlocks: many(items),
		cleanerDesc: many(cleaner),
		costs: many(schematicsCosts),
		wikiEl: one(wikiElement, {
			fields: [schematics.id],
			references: [wikiElement.elPath]
		})
	};
});

// -----------------------------------------------------
// sub-schematics
// -----------------------------------------------------

export const subSchematics = dbSchema.table(
	'sub_schematics',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		schematicPath: text('schematic_path')
			.notNull()
			.references(
				() => {
					return schematics.path;
				},
				{
					onDelete: 'cascade'
				}
			),
		subSchematicPath: text('sub_schematic_path')
			.notNull()
			.references(
				() => {
					return schematics.path;
				},
				{
					onDelete: 'cascade'
				}
			)
	},
	(t) => {
		return {
			unq: unique().on(t.subSchematicPath, t.schematicPath)
		};
	}
);

export const subSchematicsRelations = relations(subSchematics, ({ many }) => {
	return {
		schematics: many(schematics)
	};
});

// -----------------------------------------------------
// recipe unlocks
// -----------------------------------------------------

export const recipeUnlocks = dbSchema.table(
	'recipe_unlocks',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		schematicPath: text('schematic_path')
			.notNull()
			.references(
				() => {
					return schematics.path;
				},
				{
					onDelete: 'cascade'
				}
			),
		recipePath: text('recipe_path')
			.notNull()
			.references(
				() => {
					return recipes.path;
				},
				{
					onDelete: 'cascade'
				}
			)
	},
	(t) => {
		return {
			unq: unique().on(t.schematicPath, t.recipePath)
		};
	}
);

export const recipeUnlocksRelations = relations(recipeUnlocks, ({ one }) => {
	return {
		schematic: one(schematics, {
			fields: [recipeUnlocks.schematicPath],
			references: [schematics.path]
		}),
		item: one(recipes, {
			fields: [recipeUnlocks.recipePath],
			references: [recipes.path]
		})
	};
});

// -----------------------------------------------------
// scanner costs
// -----------------------------------------------------

export const schematicsCosts = dbSchema.table(
	'schematic_costs',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		schematicPath: text('schematic_path')
			.notNull()
			.references(
				() => {
					return schematics.path;
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
		amount: integer('amount').notNull()
	},
	(t) => {
		return {
			unq: unique().on(t.schematicPath, t.itemPath)
		};
	}
);

export const schematicsCostsRelations = relations(schematicsCosts, ({ one }) => {
	return {
		schematic: one(schematics, {
			fields: [schematicsCosts.schematicPath],
			references: [schematics.path]
		}),
		item: one(items, {
			fields: [schematicsCosts.itemPath],
			references: [items.path]
		})
	};
});

// -----------------------------------------------------
// scanner unlocks
// -----------------------------------------------------

export const scannerUnlocks = dbSchema.table(
	'scanner_unlocks',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		schematicPath: text('schematic_path')
			.notNull()
			.references(
				() => {
					return schematics.path;
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
			)
	},
	(t) => {
		return {
			unq: unique().on(t.schematicPath, t.itemPath)
		};
	}
);

export const scannerUnlocksRelations = relations(scannerUnlocks, ({ one }) => {
	return {
		schematic: one(schematics, {
			fields: [scannerUnlocks.schematicPath],
			references: [schematics.path]
		}),
		item: one(items, {
			fields: [scannerUnlocks.itemPath],
			references: [items.path]
		})
	};
});
