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

	return await getSearchResult(query.search);
});
