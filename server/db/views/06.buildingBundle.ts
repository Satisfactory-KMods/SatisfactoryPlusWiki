import type { InferDynamic } from '@kmods/drizzle-orm-utils';
import {
	getColumnsFromViewOrSubquery,
	pgAggJsonBuildObject,
	pgCoalesce,
	queryToFullSQLString
} from '@kmods/drizzle-orm-utils';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { buildables } from '~/server/db/index';
import { db } from '../pg';
import { dbSchema, mapping } from '../schema';
import { viewCleanerElement } from './02.cleanerElement';

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

const query = {
	...getTableColumns(buildables),
	...getTableColumns(mapping),
	cleaner: pgCoalesce(cleanerRecipes.values).as('cleaner')
};

export const viewBuildingBundle = dbSchema.view('view_building_bundle').as((db) => {
	const queryClass = db
		.with(cleanerRecipes)
		.select(query)
		.from(buildables)
		.leftJoin(mapping, eq(buildables.path, mapping.elPath))
		.leftJoin(cleanerRecipes, eq(buildables.isCleaner, cleanerRecipes.isCleaner));

	log('info', queryToFullSQLString(queryClass.toSQL(), true));

	return queryClass;
});

export type BuildingBundle = InferDynamic<typeof viewBuildingBundle>;

export function getBuildingBundleColumns() {
	return getColumnsFromViewOrSubquery(viewBuildingBundle);
}
