export default defineNuxtRouteMiddleware(async (to) => {
	const id = String(to.params.id);
	const getData = await $fetch('/api/lastVisit/:id', { params: { id } }).catch(() => {
		return null;
	});

	if (!getData) {
		return navigateTo('/');
	}

	if (to.path.endsWith(id)) {
		return navigateTo(`/show/${id}/${getData.type}`);
	}
});
