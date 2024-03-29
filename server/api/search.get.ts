import { z } from 'zod';
import type { InferReturn } from '~/utils/typeUtils';

export type ApiSearchResponse = InferReturn<typeof getSearchResult>;

export default defineEventHandler(async (event) => {
	const query = getQuery<{ search?: string; limit?: string }>(event);
	const limit = query.limit ? z.number().min(1).max(100).parse(parseInt(query.limit)) : 5;

	return await getSearchResult(query.search ?? '', limit);
});
