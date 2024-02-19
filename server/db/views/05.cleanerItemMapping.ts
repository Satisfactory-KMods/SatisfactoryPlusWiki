import { eq, isNotNull } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';
import { db } from '~/server/db/index';
import { getColumnsFromViewOrSubquery } from '~/server/utils/db';
import { cleaner, cleanerByPass, dbSchema } from '../schema';
import type { InferDynamic } from './../../utils/db/types';
import { viewCleanerElement } from './02.cleanerElement';

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
		.with(allItemsFromCleanerRecipes)
		.select({
			item: allItemsFromCleanerRecipes.item,
			cleaners: pgAggJsonBuildObject(viewCleanerElement, { aggregate: true }).as('cleaners')
		})
		.from(allItemsFromCleanerRecipes)
		.leftJoin(
			viewCleanerElement,
			eq(allItemsFromCleanerRecipes.cleaner, viewCleanerElement.path)
		)
		.where(isNotNull(allItemsFromCleanerRecipes.item))
		.groupBy(allItemsFromCleanerRecipes.item);
});

export type CleanerItemMapping = InferDynamic<typeof viewCleanerItemMapping>;

export function getCleanerItemMappingColumns() {
	return getColumnsFromViewOrSubquery(viewCleanerItemMapping);
}
