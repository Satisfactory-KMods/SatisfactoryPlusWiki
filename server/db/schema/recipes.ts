import { relations } from 'drizzle-orm';
import { boolean, integer, numeric, text, unique, uuid } from 'drizzle-orm/pg-core';
import type { SFDataType } from '~/utils/satisfactoryExtractorTypes';
import { buildables } from './buildables';
import { items } from './items';
import { dataTypeEnum, dbSchema } from './schema';
import { schematics } from './schematics';

// -----------------------------------------------------
// recipes
// -----------------------------------------------------
export const recipes = dbSchema.table('recipes', {
	path: text('path').notNull().primaryKey(),
	name: text('name').notNull(),
	image: text('image').notNull(),
	category: text('category').notNull(),
	duration: numeric('duration').notNull(),
	manuelDuration: numeric('manuel_duration').notNull(),
	isAlternate: boolean('is_alternate').notNull(),
	dataType: dataTypeEnum('data_type').$type<SFDataType>().notNull()
});

export const recipesRelations = relations(recipes, ({ many }) => {
	return {
		inputs: many(recipesInput),
		outputs: many(recipesOutput),
		producedIn: many(buildables),
		schematics: many(schematics)
	};
});

// -----------------------------------------------------
// recipesInput
// -----------------------------------------------------
export const recipesInput = dbSchema.table(
	'recipes_input',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		recipePath: text('recipe_path')
			.notNull()
			.references(
				() => {
					return recipes.path;
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
			unq: unique().on(t.recipePath, t.itemPath)
		};
	}
);

export const recipesInputRelations = relations(recipesInput, ({ one }) => {
	return {
		recipe: one(recipes, {
			fields: [recipesInput.recipePath],
			references: [recipes.path]
		}),
		item: one(items, {
			fields: [recipesInput.itemPath],
			references: [items.path]
		})
	};
});

// -----------------------------------------------------
// producedIn
// -----------------------------------------------------
export const producedIn = dbSchema.table(
	'produced_in',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		recipePath: text('recipe_path')
			.notNull()
			.references(
				() => {
					return recipes.path;
				},
				{
					onDelete: 'cascade'
				}
			),
		buildingPath: text('building_path')
			.notNull()
			.references(
				() => {
					return buildables.path;
				},
				{
					onDelete: 'cascade'
				}
			)
	},
	(t) => {
		return {
			unq: unique().on(t.recipePath, t.buildingPath)
		};
	}
);

export const producedInRelations = relations(producedIn, ({ one }) => {
	return {
		recipe: one(recipes, {
			fields: [producedIn.recipePath],
			references: [recipes.path]
		}),
		building: one(buildables, {
			fields: [producedIn.buildingPath],
			references: [buildables.path]
		})
	};
});

// -----------------------------------------------------
// recipesOutput
// -----------------------------------------------------
export const recipesOutput = dbSchema.table(
	'recipes_output',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		recipePath: text('recipe_path')
			.notNull()
			.references(
				() => {
					return recipes.path;
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
			unq: unique().on(t.recipePath, t.itemPath)
		};
	}
);

export const recipesOutputRelations = relations(recipesOutput, ({ one }) => {
	return {
		recipe: one(recipes, {
			fields: [recipesOutput.recipePath],
			references: [recipes.path]
		}),
		item: one(items, {
			fields: [recipesOutput.itemPath],
			references: [items.path]
		})
	};
});
