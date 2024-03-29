import { getResearchTreeData } from '~/server/utils/trees';
import type { InferReturn } from '~/utils/typeUtils';

export type TreeBuilderResponse = InferReturn<typeof getResearchTreeData>;

export default defineEventHandler(async (event) => {
	const tree = getRouterParam(event, 'tree');

	if (!tree) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Tree should be provided'
		});
	}

	return await getResearchTreeData(tree);
});
