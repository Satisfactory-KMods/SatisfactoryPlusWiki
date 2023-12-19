import { asc, desc } from 'drizzle-orm';
import { buildables, db, items, recipes, schematics } from '~/server/db/index';
import type { ItemInsert } from './../db/schema/items';

export type ApiSearchResponse = {
	item: Pick<ItemInsert, 'name' | 'id' | 'image' | 'path'>[];
	schematic: Pick<ItemInsert, 'name' | 'id' | 'image' | 'path'>[];
	recipe: Pick<ItemInsert, 'name' | 'id' | 'image' | 'path'>[];
	building: Pick<ItemInsert, 'name' | 'id' | 'image' | 'path'>[];
};

export default defineEventHandler(async (event) => {
	const query = getQuery<{ search: string }>(event);
	if (!query.search) {
		throw createError({ statusCode: 400, statusMessage: 'missing search parameter' });
	}

	const [building, item, schematic, recipe] = await Promise.all([
		db.query.buildables.findMany({
			where: (t, { ilike }) => {
				return ilike(t.name, `%${query.search}%`);
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
				return ilike(t.name, `%${query.search}%`);
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
				return ilike(t.name, `%${query.search}%`);
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
				return ilike(t.name, `%${query.search}%`);
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
});
