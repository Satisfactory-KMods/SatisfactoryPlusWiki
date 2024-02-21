import type { InferDynamic } from '@kmods/drizzle-orm-utils';
import {
	getColumnsFromViewOrSubquery,
	pgAggJsonBuildObject,
	pgAnyValue,
	pgCast,
	pgClearQuote,
	pgCoalesce,
	pgJsonAggCoal,
	pgJsonArrayElements
} from '@kmods/drizzle-orm-utils';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { buildables } from '~/server/db/index';
import { db } from '../pg';
import { dbSchema, mapping, recipeUnlocks } from '../schema';
import { recipesOutput } from './../schema/recipes';
import { schematics } from './../schema/schematics';
import { viewProducedInBundle } from './01.producedInBundle';
import { viewCleanerElement } from './02.cleanerElement';
import { viewRecipeBundle } from './05.recipeBundle';

const { producedIn } = getColumnsFromViewOrSubquery(viewProducedInBundle);

const unlocksPrepare = db.$with('unlocksPrepare').as(
	db
		.select({
			outputPath: recipesOutput.itemPath,
			schematicPath: schematics.path,
			schematic: pgAggJsonBuildObject(schematics).as('schematic')
		})
		.from(recipeUnlocks)
		.leftJoin(schematics, eq(recipeUnlocks.schematicPath, schematics.path))
		.leftJoin(recipesOutput, eq(recipeUnlocks.recipePath, recipesOutput.recipePath))
);

const unlocksPostPrepare = db.$with('unlocksPostPrepare').as(
	db
		.with(unlocksPrepare)
		.select({
			path: unlocksPrepare.outputPath,
			schematic: pgAnyValue(unlocksPrepare.schematic).as('schematic')
		})
		.from(unlocksPrepare)
		.groupBy(unlocksPrepare.outputPath, unlocksPrepare.schematicPath)
);

const unlocks = db.$with('unlocks').as(
	db
		.with(unlocksPostPrepare)
		.select({
			path: unlocksPostPrepare.path,
			schematics: pgJsonAggCoal(unlocksPostPrepare.schematic).as('schematics')
		})
		.from(unlocksPostPrepare)
		.groupBy(unlocksPostPrepare.path)
);

const buildingRecipePrepare = db.$with('buildingRecipePrepare').as(
	db
		.select({
			recipe: pgAggJsonBuildObject(viewRecipeBundle).as('recipe'),
			building: pgJsonArrayElements(producedIn).as('building')
		})
		.from(viewProducedInBundle)
		.leftJoin(viewRecipeBundle, eq(viewProducedInBundle.path, viewRecipeBundle.path))
);

const buildingRecipes = db.$with('buildingRecipes').as(
	db
		.with(buildingRecipePrepare)
		.select({
			path: pgClearQuote(sql`${buildingRecipePrepare.building}->>'path'`).as('bpath'),
			recipes: pgJsonAggCoal(buildingRecipePrepare.recipe).as('recipes')
		})
		.from(buildingRecipePrepare)
		.groupBy(sql`${buildingRecipePrepare.building}->>'path'`)
);

const cleanerRecipes = db.$with('cleanerRecipes').as(
	db
		.select({
			isCleaner: sql<true>`true`.as('isCleaner'),
			values: pgAggJsonBuildObject(viewCleanerElement, {
				aggregate: true
			}).as('values_c')
		})
		.from(viewCleanerElement)
		.groupBy(viewCleanerElement.dataType)
);

const recipe = db.$with('recipe').as(
	db
		.selectDistinctOn(
			[pgClearQuote(pgCast(sql`${viewRecipeBundle.output}->0->'path'`, 'varchar'))],
			{
				buildingDescPath: pgClearQuote(
					pgCast(sql`${viewRecipeBundle.output}->0->'path'`, 'varchar')
				).as('buildingDescPath'),
				recipe: pgAggJsonBuildObject(viewRecipeBundle).as('recipe')
			}
		)
		.from(viewRecipeBundle)
);

const query = {
	...getTableColumns(buildables),
	...getTableColumns(mapping),
	buildingRecipes: pgCoalesce(buildingRecipes.recipes).as('buildingRecipes'),
	cleaner: pgCoalesce(cleanerRecipes.values).as('cleaner'),
	recipe: recipe.recipe,
	schematics: unlocks.schematics
};

export const viewBuildingBundle = dbSchema.view('view_building_bundle').as((db) => {
	const queryClass = db
		.with(cleanerRecipes, recipe, buildingRecipes, unlocks)
		.select(query)
		.from(buildables)
		.leftJoin(mapping, eq(buildables.path, mapping.elPath))
		.leftJoin(recipe, eq(buildables.path, recipe.buildingDescPath))
		.leftJoin(buildingRecipes, eq(buildables.path, buildingRecipes.path))
		.leftJoin(unlocks, eq(buildables.path, unlocks.path))
		.leftJoin(cleanerRecipes, eq(buildables.isCleaner, cleanerRecipes.isCleaner));

	return queryClass;
});

export type BuildingBundle = InferDynamic<typeof viewBuildingBundle>;

export function getBuildingBundleColumns() {
	return getColumnsFromViewOrSubquery(viewBuildingBundle);
}
