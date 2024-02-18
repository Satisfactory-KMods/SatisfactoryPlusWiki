import { eq, getTableColumns } from 'drizzle-orm';
import { pgAggJsonArray, pgAggJsonBuildObject, pgCoalesce } from '../../utils/db';
import { dbSchema, mapping, recipes } from '../schema';
import { items } from '../schema/items';
import { recipeUnlocks, scannerUnlocks, schematics, schematicsCosts } from '../schema/schematics';

export const viewSchematicInformations = dbSchema.view('view_schematic_informations').as((db) => {
	const itemCostsSubQuery = db.$with('itemCostsSubQuery').as(
		db
			.select({
				schematic: schematicsCosts.schematicPath,
				data: pgAggJsonBuildObject({
					name: items.name,
					form: items.form,
					image: items.image,
					shortPath: mapping.shortPath,
					amount: schematicsCosts.amount
				}).as('data')
			})
			.from(schematicsCosts)
			.leftJoin(items, eq(schematicsCosts.itemPath, items.path))
			.leftJoin(mapping, eq(items.path, mapping.elPath))
	);

	const schematicItemCosts = db.$with('itemCosts').as(
		db
			.with(itemCostsSubQuery)
			.select({
				schematic: itemCostsSubQuery.schematic,
				costs: pgAggJsonArray(itemCostsSubQuery.data).as('costs')
			})
			.from(itemCostsSubQuery)
			.groupBy(itemCostsSubQuery.schematic)
	);

	const schematicScannerUnlocksPrepare = db.$with('scanner_prepare').as(
		db
			.select({
				schematic: scannerUnlocks.schematicPath,
				data: pgAggJsonBuildObject({
					name: items.name,
					form: items.form,
					image: items.image,
					shortPath: mapping.shortPath
				}).as('data')
			})
			.from(scannerUnlocks)
			.leftJoin(items, eq(scannerUnlocks.itemPath, items.path))
			.leftJoin(mapping, eq(scannerUnlocks.itemPath, mapping.elPath))
	);

	const schematicScannerUnlocks = db.$with('scanner').as(
		db
			.with(schematicScannerUnlocksPrepare)
			.select({
				schematic_costs: schematicScannerUnlocksPrepare.schematic,
				scanners: pgAggJsonArray(schematicScannerUnlocksPrepare.data).as('scanners')
			})
			.from(schematicScannerUnlocksPrepare)
			.groupBy(schematicScannerUnlocksPrepare.schematic)
	);

	const schematicRecipeUnlocksPrepare = db.$with('scanner_prepare').as(
		db
			.select({
				schematic: recipeUnlocks.schematicPath,
				data: pgAggJsonBuildObject({
					...getTableColumns(recipes),
					shortPath: mapping.shortPath
				}).as('data')
			})
			.from(recipeUnlocks)
			.leftJoin(recipes, eq(recipeUnlocks.recipePath, recipes.path))
			.leftJoin(mapping, eq(recipeUnlocks.recipePath, mapping.elPath))
	);

	const schematicRecipeUnlocks = db.$with('recipes').as(
		db
			.with(schematicRecipeUnlocksPrepare)
			.select({
				schematic_recipes: schematicRecipeUnlocksPrepare.schematic,
				recipes: pgAggJsonArray(schematicRecipeUnlocksPrepare.data).as('recipes')
			})
			.from(schematicRecipeUnlocksPrepare)
			.groupBy(schematicRecipeUnlocksPrepare.schematic)
	);

	return db
		.with(schematicItemCosts, schematicScannerUnlocks, schematicRecipeUnlocks)
		.select({
			...getTableColumns(schematics),
			costs: pgCoalesce(schematicItemCosts.costs).as('costs'),
			scanners: pgCoalesce(schematicScannerUnlocks.scanners).as('scanners'),
			recipes: pgCoalesce(schematicRecipeUnlocks.recipes).as('recipes')
		})
		.from(schematics)
		.leftJoin(
			schematicRecipeUnlocks,
			eq(schematics.path, schematicRecipeUnlocks.schematic_recipes)
		)
		.leftJoin(schematicItemCosts, eq(schematics.path, schematicItemCosts.schematic))
		.leftJoin(
			schematicScannerUnlocks,
			eq(schematics.path, schematicScannerUnlocks.schematic_costs)
		);
});
