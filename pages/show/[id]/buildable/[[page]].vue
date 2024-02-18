<script lang="ts" setup>
	const { params } = useParams({
		id: String(),
		page: String('information')
	});
	const { data: result } = await useFetch(`/api/data/${params.id}/item`);

	if (!result.value) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Page Not Found'
		});
	}

	const spoilerData = computed(() => {
		return {
			title: result.value!.items.name,
			description: result.value!.items.description,
			image: result.value!.items.image
		};
	});

	const headerData = computed(() => {
		const item = result.value!.items;
		return {
			...spoilerData.value,
			useSpoiler:
				item.itemTypeInformation.type === 'egg' || item.itemTypeInformation.type === 'slug'
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
		{{ navigation.findIndex((e) => e.param === params.page) }}
		{{ navigation }}
		{{ params }}
		<DataPageHeader v-bind="headerData" />
		<UHorizontalNavigation
			:links="navigation"
			:active="navigation.findIndex((e) => e.param === params.page)"
			class="border-b border-gray-200 dark:border-gray-800" />
	</div>
</template>
