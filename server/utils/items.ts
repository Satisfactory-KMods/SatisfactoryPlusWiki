import { and, eq } from 'drizzle-orm';
import { db, extraInformations, items, mapping } from '~/server/db/index';
import { wikiDesc, wikiElement } from './../db/schema/wiki';

export function getInformationForItem(shortPath: string) {
	return db
		.select()
		.from(items)
		.leftJoin(extraInformations, eq(items.path, extraInformations.itemPath))
		.leftJoin(mapping, eq(items.path, mapping.elPath))
		.leftJoin(wikiElement, eq(items.path, wikiElement.elPath))
		.leftJoin(wikiDesc, and(eq(wikiElement.id, wikiDesc.elId), eq(wikiDesc.active, true)))
		.where(eq(mapping.shortPath, shortPath))
		.limit(1)
		.then((result) => {
			if (!result.length) throw new Error('No result found');
			return result[0];
		});
}

export function getInformationForSchematic(shortPath: string) {
	return db
		.select()
		.from(items)
		.leftJoin(extraInformations, eq(items.path, extraInformations.itemPath))
		.leftJoin(mapping, eq(items.path, mapping.elPath))
		.leftJoin(wikiElement, eq(items.path, wikiElement.elPath))
		.leftJoin(wikiDesc, and(eq(wikiElement.id, wikiDesc.elId), eq(wikiDesc.active, true)))
		.where(eq(mapping.shortPath, shortPath))
		.limit(1)
		.then((result) => {
			if (!result.length) throw new Error('No result found');
			return result[0];
		});
}
