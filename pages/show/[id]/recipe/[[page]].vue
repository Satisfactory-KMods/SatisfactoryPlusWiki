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
			<DataRecipe
				:key="result!.id"
				no-divider
				:schematics="result!.schematicUnlocks"
				:data="result! as any"
				class="flex-shrink-0" />
		</div>
	</div>
</template>
