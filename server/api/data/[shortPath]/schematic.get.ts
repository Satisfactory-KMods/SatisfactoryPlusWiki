import type { InferReturn, RemoveNullFromAll } from '~/utils/typeUtils';

export type ItemDataResult = RemoveNullFromAll<InferReturn<typeof getInformationForSchematic>>;

export default defineEventHandler((event) => {
	const shortPath = getRouterParam(event, 'shortPath');

	if (!shortPath) {
		throw createError({
			statusCode: 400,
			statusMessage: 'shortPath should be provided'
		});
	}

	return getInformationForSchematic(shortPath) as Promise<ItemDataResult>;
});
