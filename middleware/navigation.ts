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
		let path = `/show/${id}/${getData.type}`;
		if (getData.type === 'researchTree') {
			path = `/research-trees/${id}`;
		}

		lastVisitStore.addVisit({
			name: getData.displayName ?? 'Unknown',
			path
		});
		return navigateTo(path as any);
	}
});
