import { db } from '~/server/db/index';

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id');
	console.log(id);

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'ID should be provided'
		});
	}

	return await db.query.mapping
		.findFirst({
			where: (t, { eq }) => {
				return eq(t.shortPath, id);
			},
			columns: {
				dataId: true,
				type: true,
				shortPath: true
			}
		})
		.catch(() => {
			return null;
		});
});
