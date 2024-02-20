import type { InferDynamic } from '@kmods/drizzle-orm-utils';
import {
	getColumnsFromViewOrSubquery,
	pgAggJsonBuildObject,
	pgCast,
	pgCoalesce
} from '@kmods/drizzle-orm-utils';
import { eq, getTableColumns } from 'drizzle-orm';
import { producedIn } from '~/server/db/index';
import { db } from '../pg';
import { dbSchema, mapping } from '../schema';
import { items } from '../schema/items';
import { buildables } from './../schema/buildables';
import { recipes, recipesInput, recipesOutput } from './../schema/recipes';

const producedInBuildings = db.$with('producedInBuildings').as(
	db
		.select({
			recipePath: producedIn.recipePath,
			values: pgAggJsonBuildObject(
				{
					...getTableColumns(buildables),
					shortPath: mapping.shortPath
				},
				{
					aggregate: true
				}
			).as('values_c')
		})
		.from(producedIn)
		.leftJoin(buildables, eq(producedIn.buildingPath, buildables.buildingPath))
		.leftJoin(mapping, eq(buildables.path, mapping.elPath))
		.groupBy(producedIn.recipePath)
);

const inputDirection = db.$with('inputDirection').as(
	db
		.select({
			recipePath: recipesInput.recipePath,
			values: pgAggJsonBuildObject(
				{
					path: items.path,
					name: items.name,
					form: items.form,
					image: items.image,
					shortPath: mapping.shortPath,
					amount: recipesInput.amount,
					time: pgCast(recipes.duration, 'float')
				},
				{
					aggregate: true
				}
			).as('values_b')
		})
		.from(recipesInput)
		.leftJoin(items, eq(recipesInput.itemPath, items.path))
		.leftJoin(recipes, eq(recipesInput.recipePath, recipes.path))
		.leftJoin(mapping, eq(recipesInput.itemPath, mapping.elPath))
		.groupBy(recipesInput.recipePath)
);

const outputDirection = db.$with('outputDirection').as(
	db
		.select({
			recipePath: recipesOutput.recipePath,
			values: pgAggJsonBuildObject(
				{
					path: items.path,
					name: items.name,
					form: items.form,
					image: items.image,
					shortPath: mapping.shortPath,
					amount: recipesOutput.amount,
					time: pgCast(recipes.duration, 'float')
				},
				{
					aggregate: true
				}
			).as('values_a')
		})
		.from(recipesOutput)
		.leftJoin(items, eq(recipesOutput.itemPath, items.path))
		.leftJoin(recipes, eq(recipesOutput.recipePath, recipes.path))
		.leftJoin(mapping, eq(recipesOutput.itemPath, mapping.elPath))
		.groupBy(recipesOutput.recipePath)
);

const query = {
	...getTableColumns(recipes),
	...getTableColumns(mapping),
	input: pgCoalesce(inputDirection.values).as('input'),
	output: pgCoalesce(outputDirection.values).as('output'),
	producedIn: pgCoalesce(producedInBuildings.values).as('producedIn')
};

export const viewRecipeBundle = dbSchema.view('view_recipe_bundle').as((db) => {
	return db
		.with(inputDirection, outputDirection, producedInBuildings)
		.select(query)
		.from(recipes)
		.leftJoin(inputDirection, eq(recipes.path, inputDirection.recipePath))
		.leftJoin(outputDirection, eq(recipes.path, outputDirection.recipePath))
		.leftJoin(producedInBuildings, eq(recipes.path, producedInBuildings.recipePath))
		.leftJoin(mapping, eq(recipes.path, mapping.elPath));
});

export type RecipeBundle = InferDynamic<typeof viewRecipeBundle>;

export function getRecipeViewColumns() {
	return getColumnsFromViewOrSubquery(viewRecipeBundle);
}
