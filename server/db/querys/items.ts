import { eq } from 'drizzle-orm';
import { db, items, mapping, schematicsCosts } from '~/server/db/index';

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

export const schematicItemCosts = db.$with('itemCosts').as(
	db
		.with(itemCostsSubQuery)
		.select({
			schematic: itemCostsSubQuery.schematic,
			costs: pgAggJsonArray(itemCostsSubQuery.data).as('costs')
		})
		.from(itemCostsSubQuery)
		.groupBy(itemCostsSubQuery.schematic)
);
