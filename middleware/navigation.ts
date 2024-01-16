export default defineNuxtRouteMiddleware(async (to) => {
	const lastVisitStore = useLastVisit();
	const id = String(to.params.id);
	const getData = await $fetch(`/api/last-visit/${id}`).catch(() => {
		return null;
	});

	if (!getData) {
		return navigateTo('/');
	}

	if (to.path.endsWith(id)) {
		lastVisitStore.addVisit({
			name: getData.displayName ?? 'Unknown',
			path: `/show/${id}/${getData.type}`
		});
		return navigateTo(`/show/${id}/${getData.type}` as any);
	}
});
