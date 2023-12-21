import type { InferReturn } from '~/utils/typeUtils';

export type ApiSearchResponse = InferReturn<typeof getSearchResult>;

export default defineEventHandler(async (event) => {
	const query = getQuery<{ search: string }>(event);
	if (!query.search) {
		throw createError({ statusCode: 400, statusMessage: 'missing search parameter' });
	}

	return await getSearchResult(query.search);
});
