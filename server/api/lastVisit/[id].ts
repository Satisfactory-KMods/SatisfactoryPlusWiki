import { db } from '~/server/db/index';
export default defineEventHandler(async (event) => {
	const id = event.context.params?.id as string;

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'ID should be provided'
		});
	}

	return db.query.buildables.findUnique({
		where: {
			id
		},
		select: {
			updatedAt: true
		}
	});
});
