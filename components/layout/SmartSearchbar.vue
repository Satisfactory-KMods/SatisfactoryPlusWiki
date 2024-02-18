<script lang="ts" setup>
	import type { ApiSearchResponse } from '~/server/api/search.get';
	import _ from 'lodash';

	const display = ref(false);
	const inputRef = ref();
	const router = useRouter();
	const { input, output: search } = useRefDelay('', doSearch, 500);

	function getDefaults() {
		return _.cloneDeep<ApiSearchResponse>({
			item: {
				count: 0,
				result: [],
				totalViews: 0
			},
			schematic: {
				count: 0,
				result: [],
				totalViews: 0
			},
			recipe: {
				count: 0,
				result: [],
				totalViews: 0
			},
			building: {
				count: 0,
				result: [],
				totalViews: 0
			},
			researchTree: {
				count: 0,
				result: [],
				totalViews: 0
			}
		});
	}

	const results = ref<ApiSearchResponse>(getDefaults());

	async function submitSearch() {
		await router.push({
			path: '/search',
			query: {
				search: input.value
			}
		});
		search.value = '';
		input.value = '';
		results.value = getDefaults();
	}

	async function doSearch() {
		if (search.value.length < 1) {
			results.value = getDefaults();
			return;
		}
		results.value = await $fetch('/api/search', { query: { search: input.value } }).catch(
			() => {
				return getDefaults();
			}
		);
	}

	const showPopover = computed(() => {
		return (
			Object.values(results.value).some((v) => {
				return v.count > 0;
			}) && display.value
		);
	});

	function clickOutsideOfPopover() {
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
			<UInput
				ref="inputRef"
				v-model="input"
				color="gray"
				variant="outline"
				placeholder="Search...">
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
						<div
							v-click-outside="{ active: showPopover, fn: clickOutsideOfPopover }"
							class="pointer-events-auto grid grid-cols-2 gap-2 p-2">
							<div v-if="!!results.item.count" class="flex h-full flex-col gap-1">
								<div
									class="font-semibolt rounded border bg-gray-100 p-1 py-1 text-center text-lg hover:bg-gray-200 dark:border-gray-950 dark:bg-gray-800 hover:dark:bg-gray-700">
									Items
								</div>
								<LayoutSmartSearchBarElement
									v-for="e in results.item.result"
									:key="e.id"
									:data="e" />
							</div>
							<div v-if="!!results.building.count" class="flex h-full flex-col gap-1">
								<div
									class="font-semibolt rounded border bg-gray-100 p-1 py-1 text-center text-lg hover:bg-gray-200 dark:border-gray-950 dark:bg-gray-800 hover:dark:bg-gray-700">
									Buildings
								</div>
								<LayoutSmartSearchBarElement
									v-for="e in results.building.result"
									:key="e.id"
									:data="e" />
							</div>
							<div
								v-if="!!results.schematic.count"
								class="flex h-full flex-col gap-1">
								<div
									class="font-semibolt rounded border bg-gray-100 p-1 py-1 text-center text-lg hover:bg-gray-200 dark:border-gray-950 dark:bg-gray-800 hover:dark:bg-gray-700">
									Schematics
								</div>
								<LayoutSmartSearchBarElement
									v-for="e in results.schematic.result"
									:key="e.id"
									:data="e" />
							</div>
							<div v-if="!!results.recipe.count" class="flex h-full flex-col gap-1">
								<div
									class="font-semibolt rounded border bg-gray-100 p-1 py-1 text-center text-lg hover:bg-gray-200 dark:border-gray-950 dark:bg-gray-800 hover:dark:bg-gray-700">
									Recipes
								</div>
								<LayoutSmartSearchBarElement
									v-for="e in results.recipe.result"
									:key="e.id"
									:data="e" />
							</div>
						</div>
					</template>
				</UPopover>
			</div>
		</div>
	</form>
</template>
