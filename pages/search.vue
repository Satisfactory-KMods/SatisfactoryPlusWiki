<script lang="ts" setup>
	const { reffer } = useQueryParams(
		{
			search: String()
		},
		() => {}
	);
	const { input } = useRefDelay(reffer.search, undefined, 500);

	const {
		data: result,
		status,
		error,
		refresh
	} = useFetch('/api/search', {
		query: {
			search: reffer.search,
			limit: 20
		}
	});

	function keyToString(key: string) {
		switch (key) {
			case 'item':
				return 'Items';
			case 'schematic':
				return 'Schematics';
			case 'recipe':
				return 'Recipes';
			case 'building':
				return 'Buildings';
			case 'researchTree':
				return 'Research Trees';
			default:
				return key;
		}
	}
</script>

<template>
	<div class="flex flex-col gap-2">
		<UInput ref="inputRef" v-model="input" color="gray" variant="outline" placeholder="Search...">
			<template #trailing>
				<span class="text-xs text-gray-500 dark:text-gray-400">
					<UIcon name="i-heroicons-magnifying-glass" />
				</span>
			</template>
		</UInput>

		<LoadingRequest v-if="!result" :status="status" :error="error" :refresh="refresh" />

		<template v-else>
			<div v-for="[key, category] of Object.entries(result).filter(([, { count }]) => !!count)" :key="key" class="flex flex-col gap-2">
				<div class="flex flex-col gap-1">
					<div
						class="rounded-lg border bg-gray-100 p-1 text-center text-2xl font-semibold text-gray-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-400">
						{{ keyToString(key) }}
					</div>
				</div>
				<div class="grid grid-cols-1 gap-1 md:grid-cols-2">
					<LayoutSmartSearchBarElement v-for="e in category.result" :key="e.id" :data="e" />
				</div>
			</div>
		</template>
	</div>
</template>
