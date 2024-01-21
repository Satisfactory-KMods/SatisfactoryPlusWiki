import { getIpAdress } from '~/server/utils/request';
import { log } from '~/utils/logger';
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

	log('error', getIpAdress(event));

	return await getMappingData(id, getIpAdress(event));
});
