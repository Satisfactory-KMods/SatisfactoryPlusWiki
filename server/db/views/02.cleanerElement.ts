import { eq, getTableColumns, isNotNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { pgAggJsonBuildObject } from '../../utils/db';
import { cleaner, dbSchema, mapping } from '../schema';
import { cleanerByPass } from '../schema/cleaners';
import { items } from '../schema/items';

export const viewCleanerElement = dbSchema.view('view_cleaner_element').as((db) => {
	const outFluid = alias(items, 'outFluid');
	const inFluid = alias(items, 'inFluid');
	const filterItem = alias(items, 'filterItem');

	const byPass = db.$with('bypass').as(
		db
			.select({
				cleanerPath: cleanerByPass.cleanerPath,
				byPass: pgAggJsonBuildObject(
					{
						name: items.name,
						form: items.form,
						image: items.image,
						shortPath: mapping.shortPath,
						time: cleanerByPass.time,
						anount: cleanerByPass.amount
					},
					undefined,
					true
				).as('byPass')
			})
			.from(cleanerByPass)
			.leftJoin(items, eq(cleanerByPass.itemPath, items.path))
			.leftJoin(mapping, eq(cleanerByPass.itemPath, mapping.elPath))
			.groupBy(cleanerByPass.cleanerPath)
	);

	return db
		.with(byPass)
		.select({
			...getTableColumns(cleaner),
			name: inFluid.name,
			description: inFluid.description,
			outFluid: pgCase(
				isNotNull(outFluid.id),
				pgAggJsonBuildObject(outFluid),
				sql<null>`NULL`
			).as('outFluid'),
			filterItem: pgAggJsonBuildObject(filterItem).as('filterItem'),
			inFluid: pgAggJsonBuildObject(inFluid).as('inFluid'),
			byPass: byPass.byPass
		})
		.from(cleaner)
		.leftJoin(outFluid, eq(cleaner.outFluid, outFluid.path))
		.leftJoin(inFluid, eq(cleaner.inFluid, inFluid.path))
		.leftJoin(byPass, eq(cleaner.path, byPass.cleanerPath))
		.leftJoin(filterItem, eq(cleaner.filterItem, filterItem.path));
});
