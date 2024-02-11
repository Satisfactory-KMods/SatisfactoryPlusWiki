<script lang="ts" setup>
	const router = useRouter();
	const route = useRoute();
	const tier = computed(() => {
		const { tier } = (route.params as { tier: string }) ?? {};
		if (typeof tier === 'string') {
			return parseInt(tier.split('-')[1] ?? '1');
		}
		return 1;
	});

	const { data: categories } = await useFetch('/api/milestones/shop');
	const navigation = computed(() => {
		return (categories.value ?? []).map((category) => {
			return {
				label: `${category.category}`,
				to: `/awsome-shop/${category.category}`
			};
		});
	});

	function checkRoute() {
		if (!((route.params as { category: string }) ?? {}).category) {
			if (!navigation.value[0]) {
				createError('No categories found');
			}
			router.replace(navigation.value[0].to);
		}
	}

	checkRoute();

	watch(() => {
		return route.params;
	}, checkRoute);
</script>

<template>
	<div>
		<UHorizontalNavigation :links="navigation" :active="tier" class="border-b border-gray-200 dark:border-gray-800" />
		<NuxtPage />
	</div>
</template>
