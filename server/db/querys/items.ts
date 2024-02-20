import { pgAggJsonBuildObject, pgJsonAggCoal } from '@kmods/drizzle-orm-utils';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { items, mapping, schematicsCosts } from '~/server/db/schema';

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
			costs: pgJsonAggCoal(itemCostsSubQuery.data).as('costs')
		})
		.from(itemCostsSubQuery)
		.groupBy(itemCostsSubQuery.schematic)
);
