import { and, count, eq, or, sql } from 'drizzle-orm';
import { SFSchematicType } from '~/utils/satisfactoryExtractorTypes';
import { db, items, schematics } from '../db';
import { wikiElement } from '../db/schema/wiki';
import { mapping } from './../db/schema/mapping';
import { recipeUnlocks, scannerUnlocks, schematicsCosts, subSchematics } from './../db/schema/schematics';

export function getMilestonesByTier(tier: number) {
	const subCosts = db.$with('subCosts').as(
		db
			.select({
				schematic_path: schematicsCosts.schematicPath,
				item_path: schematicsCosts.itemPath,
				amount: schematicsCosts.amount,
				image: items.image,
				name: items.name
			})
			.from(schematicsCosts)
			.leftJoin(items, eq(schematicsCosts.itemPath, items.path))
	);

	const subquerySchematics = db.$with('schematiccost').as(
		db
			.with(subCosts)
			.select({
				schematic_path: subCosts.schematic_path,
				costs: pgAggTable(subCosts).as('costs')
			})
			.from(subCosts)
			.groupBy(subCosts.schematic_path)
	);

	const subqueryRecipes = db.$with('recipes').as(
		db
			.select({
				schematic_path: recipeUnlocks.schematicPath,
				recipe_count: count(recipeUnlocks.id).as('recipe_count')
			})
			.from(recipeUnlocks)
			.groupBy(recipeUnlocks.schematicPath)
	);

	const subqueryScanner = db.$with('scanner').as(
		db
			.select({
				schematic_path: scannerUnlocks.schematicPath,
				scanner_count: count(scannerUnlocks.id).as('scanner_count')
			})
			.from(scannerUnlocks)
			.groupBy(scannerUnlocks.schematicPath)
	);

	const subSchemas = db.$with('subschematics').as(
		db
			.with(subquerySchematics, subqueryRecipes, subqueryScanner)
			.select({
				path: schematics.path,
				handslots: pgAggMax(schematics.handSlots).as('handslots'),
				inventorySlots: pgAggMax(schematics.inventorySlots).as('inventorySlots'),
				recipeCount: pgCast(pgCaseNumberNull(pgAggMax(subqueryRecipes.recipe_count)), 'integer').as('recipeCount'),
				scannerUnlockCount: pgCast(pgCaseNumberNull(pgAggMax(subqueryScanner.scanner_count)), 'integer').as('scannerUnlockCount')
			})
			.from(schematics)
			.leftJoin(subqueryRecipes, eq(schematics.path, subqueryRecipes.schematic_path))
			.leftJoin(subqueryScanner, eq(schematics.path, subqueryScanner.schematic_path))
			.groupBy(schematics.path)
	);

	const query = db
		.with(subquerySchematics, subqueryRecipes, subqueryScanner, subSchemas)
		.select({
			name: pgAggMax(schematics.name).as('name'),
			image: pgAggMax(schematics.image).as('image'),
			tier: pgAggMax(schematics.tier).as('tier'),
			category: pgAggMax(schematics.category).as('category'),
			views: pgAggMax(wikiElement.views).as('views'),
			handslots: pgCast(
				sql`${pgCaseNumberNull(pgAggSum(subSchemas.handslots))} + ${pgCaseNumberNull(pgAggMax(schematics.handSlots))}`,
				'integer'
			).as('handslots'),
			inventorySlots: pgCast(
				sql`${pgCaseNumberNull(pgAggSum(subSchemas.inventorySlots))} + ${pgCaseNumberNull(pgAggMax(schematics.inventorySlots))}`,
				'integer'
			).as('inventorySlots'),
			time: pgCast(pgAggMax(schematics.time), 'float').as('time'),
			recipeCount: pgCast(
				sql`${pgCaseNumberNull(pgAggSum(subSchemas.recipeCount))} + ${pgCaseNumberNull(pgAggMax(subqueryRecipes.recipe_count))}`,
				'integer'
			).as('recipeCount'),
			scannerUnlockCount: pgCast(
				sql`${pgCaseNumberNull(pgAggSum(subSchemas.scannerUnlockCount))} + ${pgCaseNumberNull(pgAggMax(subqueryScanner.scanner_count))}`,
				'integer'
			).as('scannerUnlockCount'),
			short: pgAggMax(mapping.shortPath).as('short'),
			costs: pgAggJsonFirst(subquerySchematics.costs).as('costs')
		})
		.from(schematics)
		.leftJoin(subSchematics, eq(schematics.path, subSchematics.schematicPath))
		.leftJoin(subSchemas, eq(subSchematics.subSchematicPath, subSchemas.path))
		.leftJoin(wikiElement, eq(schematics.path, wikiElement.elPath))
		.leftJoin(mapping, eq(schematics.path, mapping.elPath))
		.leftJoin(subquerySchematics, eq(schematics.path, subquerySchematics.schematic_path))
		.leftJoin(subqueryRecipes, eq(schematics.path, subqueryRecipes.schematic_path))
		.leftJoin(subqueryScanner, eq(schematics.path, subqueryScanner.schematic_path))
		.where(and(eq(schematics.tier, tier), or(eq(schematics.type, SFSchematicType.Milestone), eq(schematics.type, SFSchematicType.Tutorial))))
		.groupBy(schematics.path)
		.as('milestones');

	return db.select().from(query).orderBy(query.name);
}
