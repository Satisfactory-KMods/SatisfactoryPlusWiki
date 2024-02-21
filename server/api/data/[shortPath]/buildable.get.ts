import { getInformationForBuilding } from '~/server/utils/items';
import type { InferReturn, RemoveNullFrom } from '~/utils/typeUtils';

export type BuildingDataResult = RemoveNullFrom<
	InferReturn<typeof getInformationForBuilding>,
	'id'
>;

export default defineEventHandler((event) => {
	const shortPath = getRouterParam(event, 'shortPath');

	if (!shortPath) {
		throw createError({
			statusCode: 400,
			statusMessage: 'shortPath should be provided'
		});
	}

	return getInformationForBuilding(shortPath) as Promise<BuildingDataResult>;
});
