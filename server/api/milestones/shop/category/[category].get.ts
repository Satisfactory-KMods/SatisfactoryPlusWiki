import type { InferReturn } from '~/utils/typeUtils';

export type ShopCategoryResponse = InferReturn<typeof getShopMilestonesByCategoryGrouped>;

export default defineEventHandler(async (event) => {
	const category = getRouterParam(event, 'category');

	if (!category) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Category should be provided'
		});
	}

	return await getShopMilestonesByCategoryGrouped(decodeURIComponent(category));
});
