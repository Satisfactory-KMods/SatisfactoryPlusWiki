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
</script>

<template>
	<div class="flex flex-col gap-2">
		<DataPageHeader v-bind="headerData" />

		<div class="flex flex-col gap-2 overflow-y-auto ps-0">
			<UAlert
				icon="i-heroicons-information-circle"
				color="primary"
				variant="subtle"
				title="In the future, users will have the ability to add more information about an item
					or a building. If you don't see any additional information here, it's because
					none has been provided yet.">
			</UAlert>

			<DataRecipe
				:key="result!.id"
				no-divider
				:schematics="result!.schematicUnlocks"
				:data="result! as any"
				class="flex-shrink-0" />
		</div>
	</div>
</template>
