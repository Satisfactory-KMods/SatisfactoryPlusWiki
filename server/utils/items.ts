import { pgAggJsonBuildObject } from '@kmods/drizzle-orm-utils';
import { and, eq, not } from 'drizzle-orm';
import { db, extraInformations, items, mapping } from '~/server/db/index';
import { SFDescType } from '~/utils/satisfactoryExtractorTypes';
import { viewCleanerItemMapping } from '../db/views';
import { viewSchematicInformations } from '../db/views/04.schematicInformations';
import { wikiDesc, wikiElement } from './../db/schema/wiki';

export function getInformationForItem(shortPath: string) {
	return db
		.select({
			items: pgAggJsonBuildObject(items).as('items'),
			extraInformations: pgAggJsonBuildObject(extraInformations).as('extraInformations'),
			mapping: pgAggJsonBuildObject(mapping).as('mapping'),
			wikiElement: pgAggJsonBuildObject(wikiElement).as('wikiElement'),
			wikiDesc: pgAggJsonBuildObject(wikiDesc).as('wikiDesc'),
			viewCleanerItemMapping: viewCleanerItemMapping.cleaners
		})
		.from(items)
		.leftJoin(extraInformations, eq(items.path, extraInformations.itemPath))
		.leftJoin(mapping, eq(items.path, mapping.elPath))
		.leftJoin(wikiElement, eq(items.path, wikiElement.elPath))
		.leftJoin(wikiDesc, and(eq(wikiElement.id, wikiDesc.elId), eq(wikiDesc.active, true)))
		.leftJoin(viewCleanerItemMapping, eq(items.path, viewCleanerItemMapping.item))
		.where(
			and(
				eq(mapping.shortPath, shortPath),
				not(eq(items.descriptorType, SFDescType.BUILDING))
			)
		)
		.limit(1)
		.then((result) => {
			if (!result.length) throw new Error('No result found');
			return result[0];
		});
}

export function getInformationForSchematic(shortPath: string) {
	return db
		.select()
		.from(viewSchematicInformations)
		.where(eq(viewSchematicInformations.shortPath, shortPath))
		.limit(1)
		.then((result) => {
			if (!result.length) throw new Error('No result found');
			return result[0];
		});
}
