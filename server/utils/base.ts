import { asc, desc } from 'drizzle-orm';
import { buildables, db, items, recipes, schematics } from '~/server/db/index';

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
			limit: 5
		})
	]);

	return { item, schematic, recipe, building };
}
