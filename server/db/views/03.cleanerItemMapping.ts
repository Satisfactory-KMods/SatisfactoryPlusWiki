import type { InferDynamic } from '@kmods/drizzle-orm-utils';
import { pgAggJsonBuildObject, pgCase } from '@kmods/drizzle-orm-utils';
import { eq, getTableColumns, isNotNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../pg';
import { buildables, cleaner, dbSchema, mapping, schematics } from '../schema';
import { cleanerByPass } from '../schema/cleaners';
import { items } from '../schema/items';

const outFluid = alias(items, 'outFluid');
const inFluid = alias(items, 'inFluid');
const filterItem = alias(items, 'filterItem');

const byPass = db.$with('bypass').as(
	db
		.select({
			cleanerPath: cleanerByPass.cleanerPath,
			byPass: pgAggJsonBuildObject(
				{
					path: items.path,
					name: items.name,
					form: items.form,
					image: items.image,
					shortPath: mapping.shortPath,
					time: cleanerByPass.time,
					amount: cleanerByPass.amount
				},
				{
					aggregate: true
				}
			).as('byPass')
		})
		.from(cleanerByPass)
		.leftJoin(items, eq(cleanerByPass.itemPath, items.path))
		.leftJoin(mapping, eq(cleanerByPass.itemPath, mapping.elPath))
		.groupBy(cleanerByPass.cleanerPath)
);

const query = {
	...getTableColumns(cleaner),
	schematicData: pgAggJsonBuildObject(schematics).as('schematicData'),
	cleanerBuilding: pgAggJsonBuildObject(buildables).as('cleanerBuilding'),
	name: inFluid.name,
	description: inFluid.description,
	outFluid: pgCase(isNotNull(outFluid.id), pgAggJsonBuildObject(outFluid), sql<null>`NULL`).as(
		'outFluid'
	),
	filterItem: pgAggJsonBuildObject(filterItem).as('filterItem'),
	inFluid: pgAggJsonBuildObject(inFluid).as('inFluid'),
	byPass: byPass.byPass
};

export const viewCleanerElement = dbSchema.view('view_cleaner_element').as((db) => {
	return db
		.with(byPass)
		.select(query)
		.from(cleaner)
		.leftJoin(schematics, eq(cleaner.schematic, schematics.path))
		.leftJoin(outFluid, eq(cleaner.outFluid, outFluid.path))
		.leftJoin(
			buildables,
			eq(
				buildables.path,
				'/KLib/Assets/Buildings/Cleaner/BuildDesc_Cleaner_2.BuildDesc_Cleaner_2_C'
			)
		)
		.leftJoin(inFluid, eq(cleaner.inFluid, inFluid.path))
		.leftJoin(byPass, eq(cleaner.path, byPass.cleanerPath))
		.leftJoin(filterItem, eq(cleaner.filterItem, filterItem.path));
});

export type CleanerElement = InferDynamic<typeof viewCleanerElement>;

export function getCleanerViewColumns(): typeof query {
	// @ts-ignore
	return Object.keys(query).reduce(
		(acc, key) => {
			return {
				...acc,
				// @ts-ignore
				[key]: viewCleanerElement[key]
			};
		},
		{} as Record<string, any>
	);
}
