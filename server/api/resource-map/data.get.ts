import { getMapData } from '~/server/utils/map';

export default defineEventHandler(() => {
	return getMapData();
});
