<script lang="ts" setup>
	const { params } = useParams({
		id: String(),
		page: String('information')
	});
	const { data: result } = await useFetch(`/api/data/${params.id}/recipe`);

	if (!result.value) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Page Not Found',
			fatal: true
		});
	}

	const headerData = computed(() => {
		return {
			title: result.value!.name,
			description: '',
			image: result.value!.image,
			useSpoiler: false
		};
	});

	const navigation = computed(() => {
		const navigation = [
			{
				label: 'Item Informations',
				to: `/show/${params.id}/itemDescriptor/information`,
				param: 'information'
			}
		];

		return navigation;
	});
</script>

<template>
	<div class="flex flex-col gap-2">
		<DataPageHeader v-bind="headerData" />
		<UHorizontalNavigation
			:links="navigation"
			:active="navigation.findIndex((e) => e.param === params.page)"
			class="border-b border-gray-200 dark:border-gray-800" />
	</div>
</template>
