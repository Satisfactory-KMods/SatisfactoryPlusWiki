import { getShopCategories } from '~/server/utils/milestones';
import type { InferReturn } from '~/utils/typeUtils';

export type ShopCategoriesResponse = InferReturn<typeof getShopCategories>;

export default defineEventHandler(async () => {
	return await getShopCategories();
});
