<script setup lang="ts">
	const buttonLinks = [
		{
			href: '/milestones/tier-1',
			text: 'Milestones',
			icon: 'i-mdi-progress-upload'
		},
		{
			href: '/research-trees',
			text: 'Research Tree',
			icon: 'i-heroicons-academic-cap'
		},
		{
			href: '/map',
			text: 'Resource Map',
			icon: 'i-heroicons-map'
		},
		{
			href: '/awsome-shop',
			text: 'Awsome Shop',
			icon: 'i-mdi-shopping-outline'
		},
		{
			href: '/recipes/alternate',
			text: 'Alternate Recipes',
			icon: 'i-heroicons-book-open'
		}
	];

	const {
		data: result,
		status,
		error,
		refresh
	} = await useFetch('/api/most-visit', {
		query: {
			limit: 10
		}
	});
</script>

<template>
	<div class="flex flex-col">
		<div class="flex flex-col items-center gap-4 px-10 py-3 text-center">
			<div class="text-5xl font-semibold">Satisfactory Plus <span class="text-primary">Wiki</span></div>
			<div class="text-lg text-gray-700 dark:text-gray-300">
				Here can you find any Recipes, Awesome Shop, Items, Schematics, MAM, Buildings and also a Resource Map for our Mod. Also share and add
				more information to every page!
			</div>
			<div class="text-lg text-gray-700 dark:text-gray-300">
				This website is currently under construction so it is possible that items are not yet available or are missing. Please report these on
				our Discord Server.
			</div>
			<div class="flex flex-wrap gap-2">
				<UButton v-for="link of buttonLinks" :key="link.href" variant="outline" :to="link.href" :icon="link.icon">{{ link.text }}</UButton>
			</div>
		</div>

		<LoadingRequest v-if="!result" :status="status" :error="error" :refresh="refresh" />

		<div v-else class="grid grid-cols-2 gap-5 p-3">
			<div
				v-for="([key, category], i) of Object.entries(result).filter(([, { count }]) => !!count)"
				:key="key"
				:class="{
					'col-span-2': i === 0
				}"
				class="flex flex-col gap-2">
				<div class="flex w-full flex-col gap-1">
					<div
						class="rounded-lg border bg-gray-100 p-1 text-center text-2xl font-semibold text-gray-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-400">
						{{
							typeToString(key, {
								prefix: 'Most Visisted'
							})
						}}
					</div>
				</div>
				<div
					class="gap-1"
					:class="{
						'grid grid-cols-2': i === 0,
						'flex flex-col': i !== 0
					}">
					<LayoutSmartSearchBarElement v-for="e in category.result.slice(0, i === 0 ? 10 : 5)" :key="e.id" :data="e" />
				</div>
			</div>
		</div>
	</div>
</template>
