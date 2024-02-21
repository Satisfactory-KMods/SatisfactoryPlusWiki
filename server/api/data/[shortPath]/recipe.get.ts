import { getInformationForRecipe } from '~/server/utils/items';
import type { InferReturn, RemoveNullFrom } from '~/utils/typeUtils';

export type RecipeDataResult = RemoveNullFrom<InferReturn<typeof getInformationForRecipe>, 'id'>;

export default defineEventHandler((event) => {
	const shortPath = getRouterParam(event, 'shortPath');

	if (!shortPath) {
		throw createError({
			statusCode: 400,
			statusMessage: 'shortPath should be provided'
		});
	}

	return getInformationForRecipe(shortPath);
});
