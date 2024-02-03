import { getMilestonesByTier } from '~/server/utils/milestones';
import type { InferReturn } from '~/utils/typeUtils';

export type LastVisitResponse = InferReturn<typeof getMappingData>;

export default defineEventHandler(async (event) => {
	const tier = getRouterParam(event, 'tier');

	if (!tier) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Tier should be provided'
		});
	}

	return await getMilestonesByTier(parseInt(tier));
});
