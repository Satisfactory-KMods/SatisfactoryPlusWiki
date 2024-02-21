import { pgCoalesce, pgTable } from '@kmods/drizzle-orm-utils';
import { eq, getTableColumns } from 'drizzle-orm';
import { buildables, db, dbSchema, producedIn, recipes } from '~/server/db/index';
const producedInBundle = db.$with('pb').as(
	db
		.select({
			recipe: producedIn.recipePath,
			data: pgTable(buildables).as('data')
		})
		.from(producedIn)
		.leftJoin(buildables, eq(producedIn.buildingPath, buildables.buildingPath))
		.groupBy(producedIn.recipePath)
);

export const withProductionInBundle = db.$with('producedInBundle').as(
	db
		.with(producedInBundle)
		.select({
			...getTableColumns(recipes),
			producedIn: pgCoalesce(producedInBundle.data).as('data')
		})
		.from(recipes)
		.leftJoin(producedInBundle, eq(recipes.path, producedInBundle.recipe))
);

export const viewProducedInBundle = dbSchema.view('view_produced_in_bundle').as(() => {
	return db.with(withProductionInBundle).select().from(withProductionInBundle);
});
