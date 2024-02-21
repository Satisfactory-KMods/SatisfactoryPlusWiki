import type { InferReturn, RemoveNullFrom } from '~/utils/typeUtils';

export type ItemDataResult = RemoveNullFrom<
	InferReturn<typeof getInformationForItem>,
	'mapping' | 'wikiElement' | 'extraInformations'
>;

export default defineEventHandler((event) => {
	const shortPath = getRouterParam(event, 'shortPath');

	if (!shortPath) {
		throw createError({
			statusCode: 400,
			statusMessage: 'shortPath should be provided'
		});
	}

	return getInformationForItem(shortPath) as Promise<ItemDataResult>;
});
