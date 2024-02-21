import type { InferDynamic } from '@kmods/drizzle-orm-utils';
import {
	getColumnsFromViewOrSubquery,
	pgAggJsonBuildObject,
	pgCast,
	pgClearQuote,
	pgCoalesce,
	pgJsonAggCoal,
	pgJsonArrayElements,
	queryToFullSQLString
} from '@kmods/drizzle-orm-utils';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { buildables } from '~/server/db/index';
import { db } from '../pg';
import { dbSchema, mapping } from '../schema';
import { viewProducedInBundle } from './01.producedInBundle';
import { viewCleanerElement } from './02.cleanerElement';
import { viewRecipeBundle } from './05.recipeBundle';

const { producedIn, ...withoutProducedIn } = getColumnsFromViewOrSubquery(viewProducedInBundle);

const buildingRecipePrepare = db.$with('buildingRecipePrepare').as(
	db
		.select({
			recipe: pgAggJsonBuildObject(withoutProducedIn).as('recipe'),
			building: pgJsonArrayElements(producedIn).as('building')
		})
		.from(viewProducedInBundle)
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
	recipe: recipe.recipe
};

export const viewBuildingBundle = dbSchema.view('view_building_bundle').as((db) => {
	const queryClass = db
		.with(cleanerRecipes, recipe, buildingRecipes)
		.select(query)
		.from(buildables)
		.leftJoin(mapping, eq(buildables.path, mapping.elPath))
		.leftJoin(recipe, eq(buildables.path, recipe.buildingDescPath))
		.leftJoin(buildingRecipes, eq(buildables.path, buildingRecipes.path))
		.leftJoin(cleanerRecipes, eq(buildables.isCleaner, cleanerRecipes.isCleaner));

	log('info', queryToFullSQLString(queryClass.toSQL(), false));

	return queryClass;
});

export type BuildingBundle = InferDynamic<typeof viewBuildingBundle>;

export function getBuildingBundleColumns() {
	return getColumnsFromViewOrSubquery(viewBuildingBundle);
}
