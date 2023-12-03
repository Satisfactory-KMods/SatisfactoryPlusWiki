<script lang="ts" setup>
	import type { ApiSearchResponse } from '~/server/api/search.get';

	const display = ref(false);
	const inputRef = ref();
	const router = useRouter();
	const { input, output: search } = useRefDelay('', doSearch, 500);
	const results = ref<ApiSearchResponse>({
		item: [],
		schematic: [],
		recipe: [],
		building: []
	});

	async function submitSearch() {
		await router.push({
			path: '/search',
			query: {
				search: search.value
			}
		});
		display.value = false;
		search.value = '';
		input.value = '';
	}

	async function doSearch() {
		if (search.value.length < 1) {
			results.value.building = [];
			results.value.schematic = [];
			results.value.recipe = [];
			results.value.item = [];
			return;
		}

		results.value = await $fetch('/api/search', { query: { search: input.value } }).catch(() => {
			return {
				item: [],
				schematic: [],
				recipe: [],
				building: []
			};
		});
	}

	const showPopover = computed(() => {
		return Object.values(results.value).some((v) => v.length > 0) && display.value;
	});

	async function clickOutsideOfPopover() {
		const el: HTMLInputElement = inputRef.value.$el.querySelector('input');
		if (document.activeElement === el) {
			return;
		}
		display.value = false;
	}

	onMounted(() => {
		const el: HTMLInputElement = inputRef.value.$el.querySelector('input');
		el.addEventListener('focus', () => {
			display.value = true;
		});
	});
</script>

<template>
	<form class="flex items-center gap-2" @submit.prevent="submitSearch">
		<div class="relative">
			<UInput ref="inputRef" v-model="input" color="gray" variant="outline" placeholder="Search...">
				<template #trailing>
					<span class="text-xs text-gray-500 dark:text-gray-400">
						<UIcon name="i-heroicons-magnifying-glass" />
					</span>
				</template>
			</UInput>
			<div class="pointer-events-none absolute top-4 h-full w-full">
				<UPopover :popper="{ arrow: true }" :open="showPopover">
					<div />
					<template #panel>
						<div class="pointer-events-auto grid grid-cols-2 gap-2 p-2" v-click-outside="clickOutsideOfPopover">
							<div class="flex h-full flex-col gap-1 rounded border bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-800">
								<div class="font-semibolt py-1 text-center text-lg">Items</div>
								<LayoutSmartSearchBarElement v-for="e in results.item" :key="e.id" :data="e" />
							</div>
							<div class="flex h-full flex-col gap-1 rounded border bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-800">
								<div class="font-semibolt py-1 text-center text-lg">Buildings</div>
								<LayoutSmartSearchBarElement v-for="e in results.building" :key="e.id" :data="e" />
							</div>
							<div class="flex h-full flex-col gap-1 rounded border bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-800">
								<div class="font-semibolt py-1 text-center text-lg">Schematics</div>
								<LayoutSmartSearchBarElement v-for="e in results.schematic" :key="e.id" :data="e" />
							</div>
							<div class="flex h-full flex-col gap-1 rounded border bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-800">
								<div class="font-semibolt py-1 text-center text-lg">Recipes</div>
								<LayoutSmartSearchBarElement v-for="e in results.recipe" :key="e.id" :data="e" />
							</div>
						</div>
					</template>
				</UPopover>
			</div>
		</div>
	</form>
</template>
