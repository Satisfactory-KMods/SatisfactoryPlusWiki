import { count, eq, isNull, notInArray, sql } from 'drizzle-orm';
import type { SFItemForm } from '~/utils/satisfactoryExtractorTypes';
import { SFSchematicType } from '~/utils/satisfactoryExtractorTypes';
import {
	db,
	dbSchema,
	items,
	mapping,
	recipeUnlocks,
	scannerUnlocks,
	schematics,
	schematicsCosts
} from '..';
import { wikiElement } from '../schema/wiki';

const subCosts = db.$with('subCosts').as(
	// we use sql for items to remove nulls
	db
		.select({
			schematic_path: schematicsCosts.schematicPath,
			item_path: schematicsCosts.itemPath,
			form: sql<SFItemForm>`${items.form}`.as('form'),
			amount: schematicsCosts.amount,
			image: sql<string>`${items.image}`.as('image'),
			name: sql<string>`${items.name}`.as('name')
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

const cost = pgAggJsonFirst(subquerySchematics.costs);

const query = db
	.with(subquerySchematics, subqueryRecipes, subqueryScanner)
	.select({
		path: schematics.path,
		name: pgAggMax(schematics.name).as('name'),
		image: pgAggMax(schematics.image).as('image'),
		tier: pgAggMax(schematics.tier).as('tier'),
		type: pgAggMax(schematics.type).as('type'),
		category: pgAggMax(schematics.category).as('category'),
		subCategory: pgAggMax(schematics.subCategory).as('subCategory'),
		views: pgAggMax(wikiElement.views).as('views'),
		handslots: pgAggMax(schematics.handSlots).as('handslots'),
		inventorySlots: pgAggMax(schematics.inventorySlots).as('inventorySlots'),
		time: pgCast(pgAggMax(schematics.time), 'float').as('time'),
		recipeCount: pgAggMax(subqueryRecipes.recipe_count).as('recipeCount'),
		scannerUnlockCount: pgAggMax(subqueryScanner.scanner_count).as('scannerUnlockCount'),
		short: pgAggMax(mapping.shortPath).as('short'),
		costs: pgCase<typeof cost, typeof cost>(isNull(cost), sql`'[]'::json`, cost).as('costs')
	})
	.from(schematics)
	.leftJoin(wikiElement, eq(schematics.path, wikiElement.elPath))
	.leftJoin(mapping, eq(schematics.path, mapping.elPath))
	.leftJoin(subquerySchematics, eq(schematics.path, subquerySchematics.schematic_path))
	.leftJoin(subqueryRecipes, eq(schematics.path, subqueryRecipes.schematic_path))
	.leftJoin(subqueryScanner, eq(schematics.path, subqueryScanner.schematic_path))
	.groupBy(schematics.path)
	.as('milestones');

export const matMilestones = createAutomaticMaterilizedView(
	dbSchema.materializedView('mat_milestones').as(() => {
		return db
			.select({
				path: query.path,
				name: query.name,
				image: query.image,
				tier: query.tier,
				type: query.type,
				category: query.category,
				subCategory: query.subCategory,
				views: query.views,
				handslots: query.handslots,
				inventorySlots: query.inventorySlots,
				time: query.time,
				recipeCount: query.recipeCount,
				scannerUnlockCount: query.scannerUnlockCount,
				short: query.short,
				costs: pgCase<typeof cost, typeof cost>(
					eq(pgCast(sql`${query.costs}`, 'text'), 'null'),
					sql`'[]'::json`,
					sql`${query.costs}`
				).as('costs')
			})
			.from(query)
			.where(notInArray(query.type, [SFSchematicType.Cheat, SFSchematicType.Custom]))
			.orderBy(query.name);
	}),
	{
		cron: '* */5 * * *',
		db,
		concurrently: false
	}
);
