import { relations } from 'drizzle-orm';
import { boolean, integer, numeric, text, unique, uuid } from 'drizzle-orm/pg-core';
import { buildables } from './buildables';
import { items } from './items';
import { dbSchema } from './schema';
import { schematics } from './schematics';

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
	isHatcheryModul: boolean('is_hatchery_modul').default(false).notNull()
});

export const extraInformationsRelations = relations(extraInformations, ({ one, many }) => {
	return {
		buildable: one(buildables, {
			fields: [extraInformations.buildablePath],
			references: [buildables.path]
		}),
		item: one(items, {
			fields: [extraInformations.itemPath],
			references: [items.path]
		}),
		usedIn: many(extraRecipe, { relationName: 'used_in_rl' }),
		producedIn: many(extraRecipe, { relationName: 'produced_in_rl' })
	};
});

export const extraRecipe = dbSchema.table('extra_recipe', {
	id: uuid('id').defaultRandom().primaryKey(),
	usedIn: uuid('used_in').references(
		() => {
			return extraInformations.id;
		},
		{ onDelete: 'cascade' }
	),
	producedIn: uuid('produced_in').references(
		() => {
			return extraInformations.id;
		},
		{ onDelete: 'cascade' }
	),
	buildingRecipe: boolean('building_recipe').default(false).notNull(),
	wasteProducer: text('waste_producer').default('').notNull(),
	productionElement: text('production_element').default('').notNull(),
	type: integer('type').default(0).notNull()
});

export const extraRecipeRelations = relations(extraRecipe, ({ one, many }) => {
	return {
		extraInformationIn: one(extraInformations, {
			fields: [extraRecipe.usedIn],
			references: [extraInformations.id],
			relationName: 'used_in_rl'
		}),
		extraInformationOut: one(extraInformations, {
			fields: [extraRecipe.producedIn],
			references: [extraInformations.id],
			relationName: 'produced_in_rl'
		}),
		schematics: many(extraRecipeSchematics),
		input: many(extraRecipeInput),
		output: many(extraRecipeOutput)
	};
});

// -----------------------------------------------------
// schematics
// -----------------------------------------------------
export const extraRecipeSchematics = dbSchema.table(
	'extra_recipe_schematics',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		extraRecipe: uuid('extra_recipe')
			.notNull()
			.references(
				() => {
					return extraRecipe.id;
				},
				{
					onDelete: 'cascade'
				}
			),
		schematicPath: text('item_path')
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
			unq: unique().on(t.extraRecipe, t.schematicPath)
		};
	}
);

export const extraRecipeSchematicsRelations = relations(extraRecipeSchematics, ({ one }) => {
	return {
		recipe: one(extraRecipe, {
			fields: [extraRecipeSchematics.extraRecipe],
			references: [extraRecipe.id]
		}),
		item: one(schematics, {
			fields: [extraRecipeSchematics.schematicPath],
			references: [schematics.path]
		})
	};
});

// -----------------------------------------------------
// recipesInput
// -----------------------------------------------------
export const extraRecipeInput = dbSchema.table(
	'extra_recipe_input',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		extraRecipe: uuid('extra_recipe')
			.notNull()
			.references(
				() => {
					return extraRecipe.id;
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
		amount: integer('amount').notNull(),
		time: numeric('time').notNull()
	},
	(t) => {
		return {
			unq: unique().on(t.extraRecipe, t.itemPath)
		};
	}
);

export const extraRecipeInputRelations = relations(extraRecipeInput, ({ one }) => {
	return {
		recipe: one(extraRecipe, {
			fields: [extraRecipeInput.extraRecipe],
			references: [extraRecipe.id]
		}),
		item: one(items, {
			fields: [extraRecipeInput.itemPath],
			references: [items.path]
		})
	};
});

// -----------------------------------------------------
// recipesOutput
// -----------------------------------------------------
export const extraRecipeOutput = dbSchema.table(
	'extra_recipe_output',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		extraRecipe: uuid('extra_recipe')
			.notNull()
			.references(
				() => {
					return extraRecipe.id;
				},
				{
					onDelete: 'cascade'
				}
			),
		itemPath: text('item_path').notNull(),
		amount: integer('amount').notNull(),
		time: numeric('time').notNull()
	},
	(t) => {
		return {
			unq: unique().on(t.extraRecipe, t.itemPath)
		};
	}
);

export const extraRecipeOutputRelations = relations(extraRecipeOutput, ({ one }) => {
	return {
		recipe: one(extraRecipe, {
			fields: [extraRecipeOutput.extraRecipe],
			references: [extraRecipe.id]
		}),
		item: one(items, {
			fields: [extraRecipeOutput.itemPath],
			references: [items.path]
		}),
		buildable: one(buildables, {
			fields: [extraRecipeOutput.itemPath],
			references: [buildables.path]
		})
	};
});
