import type { InferDynamic } from '@kmods/drizzle-orm-utils';
import { getColumnsFromViewOrSubquery, pgAggJsonBuildObject } from '@kmods/drizzle-orm-utils';
import { eq, isNotNull } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';
import { db } from '~/server/db/index';
import { cleaner, cleanerByPass, dbSchema } from '../schema';
import { viewCleanerWith } from './02.cleanerElement';

const allItemsFromCleanerRecipes = db
	.$with('uni')
	.as(
		unionAll(
			db.select({ item: cleaner.outFluid, cleaner: cleaner.path }).from(cleaner),
			db.select({ item: cleaner.inFluid, cleaner: cleaner.path }).from(cleaner),
			db.select({ item: cleaner.filterItem, cleaner: cleaner.path }).from(cleaner),
			db
				.select({ item: cleanerByPass.itemPath, cleaner: cleanerByPass.cleanerPath })
				.from(cleanerByPass)
		)
	);

export const viewCleanerItemMapping = dbSchema.view('view_cleaner_item_mapping').as((db) => {
	return db
		.with(allItemsFromCleanerRecipes, viewCleanerWith)
		.select({
			item: allItemsFromCleanerRecipes.item,
			cleaners: pgAggJsonBuildObject(viewCleanerWith, { aggregate: true }).as('cleaners')
		})
		.from(allItemsFromCleanerRecipes)
		.leftJoin(viewCleanerWith, eq(allItemsFromCleanerRecipes.cleaner, viewCleanerWith.path))
		.where(isNotNull(allItemsFromCleanerRecipes.item))
		.groupBy(allItemsFromCleanerRecipes.item);
});

export type CleanerItemMapping = InferDynamic<typeof viewCleanerItemMapping>;

export function getCleanerItemMappingColumns() {
	return getColumnsFromViewOrSubquery(viewCleanerItemMapping);
}
