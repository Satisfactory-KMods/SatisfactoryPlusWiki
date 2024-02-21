import type { InferReturn } from '~/utils/typeUtils';
import { getMapData } from '~/server/utils/map';

export default defineEventHandler(async () => {
	return await getMapData();
});

export type ResourceMapData = InferReturn<typeof getMapData>;
