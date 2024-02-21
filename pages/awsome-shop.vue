<script lang="ts" setup>
	const { data: categories } = await useFetch('/api/milestones/shop');
	const navigation = computed(() => {
		return (categories.value ?? []).map((category) => {
			return {
				label: `${category.category}`,
				to: `/awsome-shop/${category.category}`
			};
		});
	});
</script>

<template>
	<div>
		<UHorizontalNavigation
			:links="navigation"
			class="border-b border-gray-200 dark:border-gray-800" />
		<NuxtPage />
	</div>
</template>
