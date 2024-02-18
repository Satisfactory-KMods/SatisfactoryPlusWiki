import { eq, getTableColumns } from 'drizzle-orm';
import { buildables, db, dbSchema, producedIn, recipes } from '~/server/db/index';

export const viewProducedInBundle = dbSchema.view('view_produced_in_bundle').as(() => {
	const producedInBundle = db.$with('pb').as(
		db
			.select({
				recipe: producedIn.recipePath,
				data: pgAggTable(buildables).as('data')
			})
			.from(producedIn)
			.leftJoin(buildables, eq(producedIn.buildingPath, buildables.buildingPath))
			.groupBy(producedIn.recipePath)
	);

	return db
		.with(producedInBundle)
		.select({
			...getTableColumns(recipes),
			producedIn: pgCoalesce(producedInBundle.data).as('data')
		})
		.from(recipes)
		.leftJoin(producedInBundle, eq(recipes.path, producedInBundle.recipe));
});
