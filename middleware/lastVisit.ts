export default defineNuxtRouteMiddleware(async (to, from) => {
	const getData = await $fetch('/api/lastVisit/:id', { params: { id: to.params.id } }).catch(() => {
		return null;
	});

	if (!getData) {
		navigateTo('/');
	}

	if (process.server) return;
	const lastVisitStore = useLastVisit();
});
