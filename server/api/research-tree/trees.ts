import type { InferReturn } from '~/utils/typeUtils';

export type TreesResponse = InferReturn<typeof getMappingData>;

export default defineEventHandler(async (event) => {
	return { todo: true };
});
