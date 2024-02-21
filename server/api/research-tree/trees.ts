import { getResearchTrees } from '~/server/utils/trees';
import type { InferReturn } from '~/utils/typeUtils';

export type TreesResponse = InferReturn<typeof getResearchTrees>;

export default defineEventHandler(async () => {
	return await getResearchTrees();
});
