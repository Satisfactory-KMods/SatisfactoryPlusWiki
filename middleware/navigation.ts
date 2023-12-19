export default defineNuxtRouteMiddleware(async (to) => {
	const id = String(to.params.id);
	const getData = await $fetch(`/api/last-visit/${id}`).catch(() => {
		return null;
	});

	if (!getData) {
		return navigateTo('/');
	}

	if (to.path.endsWith(id)) {
		return navigateTo(`/show/${id}/${getData.type}` as any);
	}
});
