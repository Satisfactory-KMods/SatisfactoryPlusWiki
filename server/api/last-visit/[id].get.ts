import type { InferReturn } from '~/utils/typeUtils';

export type LastVisitResponse = InferReturn<typeof getMappingData>;

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id');

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'ID should be provided'
		});
	}

	return await getMappingData(id);
});
