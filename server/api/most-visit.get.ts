import { z } from 'zod';
import type { InferReturn } from '~/utils/typeUtils';

export type ApiSearchResponse = InferReturn<typeof getMostVisits>;

export default defineEventHandler(async (event) => {
	const query = getQuery<{ limit: string }>(event);
	if (!query.limit) {
		throw createError({ statusCode: 400, statusMessage: 'missing search parameter' });
	}

	const limit = z.number().min(1).max(100).parse(parseInt(query.limit));
	return await getMostVisits(limit);
});
