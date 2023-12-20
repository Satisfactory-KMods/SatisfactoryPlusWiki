export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id');

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'ID should be provided'
		});
	}

	return await getItemData(id);
});
