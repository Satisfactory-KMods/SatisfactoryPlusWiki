import type { InferDynamic } from '@kmods/drizzle-orm-utils';
import { pgAggJsonBuildObject, pgCoalesce, pgJsonAggCoal } from '@kmods/drizzle-orm-utils';
import { eq, getTableColumns } from 'drizzle-orm';
import { dbSchema, mapping } from '../schema';
import { items } from '../schema/items';
import { recipeUnlocks, scannerUnlocks, schematics, schematicsCosts } from '../schema/schematics';
import { viewCleanerWith } from './02.cleanerElement';
import { withRecipeBundle } from './05.recipeBundle';

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
				costs: pgJsonAggCoal(itemCostsSubQuery.data).as('costs')
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
				scanners: pgJsonAggCoal(schematicScannerUnlocksPrepare.data).as('scanners')
			})
			.from(schematicScannerUnlocksPrepare)
			.groupBy(schematicScannerUnlocksPrepare.schematic)
	);

	const schematicRecipeUnlocks = db.$with('recipes').as(
		db
			.with(withRecipeBundle)
			.select({
				schematic: recipeUnlocks.schematicPath,
				data: pgAggJsonBuildObject(withRecipeBundle, { aggregate: true }).as('data')
			})
			.from(recipeUnlocks)
			.leftJoin(withRecipeBundle, eq(recipeUnlocks.recipePath, withRecipeBundle.path))
			.groupBy(recipeUnlocks.schematicPath)
	);

	const cleanerUnlocks = db.$with('cleaner').as(
		db
			.with(viewCleanerWith)
			.select({
				schematic_cleaner: viewCleanerWith.schematic,
				cleanerData: pgAggJsonBuildObject(viewCleanerWith, { aggregate: true }).as(
					'cleanerData'
				)
			})
			.from(viewCleanerWith)
			.groupBy(viewCleanerWith.schematic)
	);

	return db
		.with(schematicItemCosts, schematicScannerUnlocks, schematicRecipeUnlocks, cleanerUnlocks)
		.select({
			...getTableColumns(mapping),
			...getTableColumns(schematics),
			costs: pgCoalesce(schematicItemCosts.costs).as('costs'),
			scanners: pgCoalesce(schematicScannerUnlocks.scanners).as('scanners'),
			recipes: pgCoalesce(schematicRecipeUnlocks.data).as('recipes'),
			cleaner: pgCoalesce(cleanerUnlocks.cleanerData).as('cleaner')
		})
		.from(schematics)
		.leftJoin(mapping, eq(schematics.path, mapping.elPath))
		.leftJoin(cleanerUnlocks, eq(schematics.path, cleanerUnlocks.schematic_cleaner))
		.leftJoin(schematicRecipeUnlocks, eq(schematics.path, schematicRecipeUnlocks.schematic))
		.leftJoin(schematicItemCosts, eq(schematics.path, schematicItemCosts.schematic))
		.leftJoin(
			schematicScannerUnlocks,
			eq(schematics.path, schematicScannerUnlocks.schematic_costs)
		);
});

export type SchematicInformations = InferDynamic<typeof viewSchematicInformations>;
