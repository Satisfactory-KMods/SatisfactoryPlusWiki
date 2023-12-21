import { asc, desc, eq, not } from 'drizzle-orm';
import { buildables, db, items, recipes, researchTree, schematics } from '~/server/db/index';
import { wikiElement } from '../db/schema/wiki';

export function getMappingData(id: string) {
	return db.query.mapping
		.findFirst({
			where: (t, { eq }) => {
				return eq(t.shortPath, id);
			},
			columns: {
				dataId: true,
				type: true,
				shortPath: true
			}
		})
		.catch(() => {
			return null;
		});
}

export async function getSearchResult(search: string) {
	const [building, item, schematic, recipe] = await Promise.all([
		db.query.buildables.findMany({
			where: (t, { ilike }) => {
				return ilike(t.name, `%${search}%`);
			},
			orderBy: [asc(buildables.name), desc(buildables.id)],
			columns: {
				name: true,
				id: true,
				image: true,
				path: true
			},
			with: {
				wikiEl: true
			},
			limit: 5
		}),
		db.query.items.findMany({
			where: (t, { ilike }) => {
				return ilike(t.name, `%${search}%`);
			},
			orderBy: [asc(items.name), desc(items.id)],
			columns: {
				name: true,
				id: true,
				image: true,
				path: true
			},
			with: {
				wikiEl: true
			},
			limit: 5
		}),
		db.query.schematics.findMany({
			where: (t, { ilike }) => {
				return ilike(t.name, `%${search}%`);
			},
			orderBy: [asc(schematics.name), desc(schematics.id)],
			columns: {
				name: true,
				id: true,
				image: true,
				path: true
			},
			with: {
				wikiEl: true
			},
			limit: 5
		}),
		db.query.recipes.findMany({
			where: (t, { ilike }) => {
				return ilike(t.name, `%${search}%`);
			},
			orderBy: [asc(recipes.name), desc(recipes.id)],
			columns: {
				name: true,
				id: true,
				image: true,
				path: true
			},
			with: {
				wikiEl: true
			},
			limit: 5
		})
	]);

	return { item, schematic, recipe, building };
}

export type MostVisitResult = {
	name: string;
	id: string;
	image: string;
	path: string;
	views: number;
};

export function getMostVisitsFor<T extends typeof recipes | typeof researchTree | typeof schematics | typeof buildables | typeof items>(
	table: T,
	limit = 5
) {
	return db
		.select({ name: table.name, id: table.id, image: table.image, path: table.path, views: wikiElement.views })
		.from(table)
		.leftJoin(wikiElement, eq(table.path, wikiElement.elPath))
		.orderBy(desc(wikiElement.views), asc(table.name))
		.where(not(eq(table.name, '')))
		.limit(limit);
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
