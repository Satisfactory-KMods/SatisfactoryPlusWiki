import { z } from 'zod';
import type { InferReturn } from '~/utils/typeUtils';
import { inlineCatch } from '../utils/trees';

export type ApiSearchResponse = InferReturn<typeof getMostVisits>;

export default defineEventHandler(async (event) => {
	const query = getQuery<{ limit: string }>(event);
	if (!query.limit) {
		throw createError({ statusCode: 400, statusMessage: 'missing search parameter' });
	}

	const limit = inlineCatch(() => {
		return z.number().min(1).max(100).parse(parseInt(query.limit));
	}, 10);
	return await getMostVisits(limit);
});
