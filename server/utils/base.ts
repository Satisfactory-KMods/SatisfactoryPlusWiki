import type { SQL } from 'drizzle-orm';
import { and, asc, desc, eq, ilike, isNotNull, not, or, sql } from 'drizzle-orm';
import { buildables, db, items, recipes, researchTree, schematics } from '~/server/db/index';
import { log } from '~/utils/logger';
import { SFDescType } from '~/utils/satisfactoryExtractorTypes';
import { wikiElement } from '../db/schema/wiki';
import { hasReaded, setReaded } from '../plugins/02.schedules';

export async function getMappingData(id: string, user: string) {
	const result = await db.query.mapping
		.findFirst({
			where: (t, { eq }) => {
				return eq(t.shortPath, id);
			},
			columns: {
				dataId: true,
				type: true,
				shortPath: true,
				displayName: true,
				elPath: true
			}
		})
		.catch(() => {
			return null;
		});

	if (result) {
		const { elPath, ...rest } = result;
		if (!elPath || hasReaded(elPath, user)) return rest;

		await db
			.update(wikiElement)
			.set({ views: sql`${wikiElement.views} + 1` })
			.where(eq(wikiElement.elPath, elPath))
			.then(() => {
				setReaded(elPath, user);
			})
			.catch((e: any) => {
				log('error', `Failed to update views for ${elPath}`, e.message);
			});
		return rest;
	}
	return result;
}

export async function getSearchResultForTable<
	T extends
		| typeof recipes
		| typeof researchTree
		| typeof schematics
		| typeof buildables
		| typeof items
>(table: T, searchString: string, limit = 5) {
	searchString = `%${searchString}%`;

	const result = await db
		.select({
			name: table.name,
			id: table.id,
			image: table.image,
			path: table.path,
			views: wikiElement.views
		})
		.from(table)
		.leftJoin(wikiElement, eq(table.path, wikiElement.elPath))
		.orderBy(asc(table.name), desc(table.id))
		.where(
			and(
				isNotNull(wikiElement.views),
				not(eq(table.name, '')),
				// @ts-ignore
				table.itemTypeInformation
					? or(
							ilike(table.name, searchString),
							// @ts-ignore
							sql`${table.itemTypeInformation}->>'hiddenName'::varchar ilike ${searchString}`
						)
					: ilike(table.name, searchString)
			)
		)
		.limit(limit);

	return {
		result,
		count: result.length,
		totalViews: result.reduce((acc, cur) => {
			return acc + (cur.views ?? 0);
		}, 0)
	};
}

export async function getSearchResult(search: string, limit = 5) {
	const [building, item, schematic, recipe, researchTrees] = await Promise.all([
		getSearchResultForTable(buildables, search, limit),
		getSearchResultForTable(items, search, limit),
		getSearchResultForTable(schematics, search, limit),
		getSearchResultForTable(recipes, search, limit),
		getSearchResultForTable(researchTree, search, limit)
	]);

	return { item, schematic, recipe, building, researchTree: researchTrees };
}

export type MostVisitResult = {
	name: string;
	id: string;
	image: string;
	path: string;
	views: number;
};

export async function getMostVisitsFor<
	T extends
		| typeof recipes
		| typeof researchTree
		| typeof schematics
		| typeof buildables
		| typeof items
>(table: T, limit = 5) {
	const ands: SQL[] = [];

	// @ts-ignore
	if (table.descriptorType) {
		// @ts-ignore
		ands.push(not(eq(table.descriptorType, SFDescType.BUILDING)));
	}

	const result = await db
		.select({
			name: table.name,
			id: table.id,
			image: table.image,
			path: table.path,
			views: wikiElement.views
		})
		.from(table)
		.leftJoin(wikiElement, eq(table.path, wikiElement.elPath))
		.orderBy(desc(wikiElement.views), asc(table.name))
		.where(and(...ands, isNotNull(wikiElement.views), not(eq(table.name, ''))))
		.limit(limit);

	return {
		result,
		count: result.length,
		totalViews: result.reduce((acc, cur) => {
			return acc + (cur.views ?? 0);
		}, 0)
	};
}

export async function getMostVisits(limit = 5) {
	const [building, item, schematic, recipe, researchTrees] = await Promise.all([
		getMostVisitsFor(buildables, limit),
		getMostVisitsFor(items, limit),
		getMostVisitsFor(schematics, limit),
		getMostVisitsFor(recipes, limit),
		getMostVisitsFor(researchTree, limit)
	]);

	return { item, schematic, recipe, building, researchTree: researchTrees };
}
