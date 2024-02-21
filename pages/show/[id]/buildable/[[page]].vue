<script lang="ts" setup>
	import type { BuildingDataResult } from '~/server/api/data/[shortPath]/buildable.get';
	import { vInfiniteScroll } from '~/utils/utils';

	const { params } = useParams({
		id: String(),
		page: String('information')
	});
	const { data: result } = await useFetch(`/api/data/${params.id}/buildable`);

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
			description: result.value!.description,
			image: result.value!.image,
			useSpoiler: false
		};
	});

	const navigation = computed(() => {
		const navigation = [
			{
				label: 'Building Informations',
				to: `/show/${params.id}/buildable`,
				param: 'information'
			}
		];

		const recipeCount = result.value!.cleaner.length + result.value!.buildingRecipes.length;

		if (recipeCount > 0) {
			navigation.push({
				label: `Recipes (${recipeCount})`,
				to: `/show/${params.id}/buildable/${result.value!.isCleaner ? 'cleaner' : 'recipes'}`,
				param: 'recipes'
			});
		}

		if (result.value!.schematics.length) {
			navigation.push({
				label: `Unlocked In (${result.value!.schematics.length})`,
				to: `/show/${params.id}/buildable/schematics`,
				param: 'recipes'
			});
		}

		return navigation;
	});

	const input = ref('');
	const all = computed(() => {
		let data: BuildingDataResult['cleaner'] | BuildingDataResult['buildingRecipes'] = [];
		switch (params.page) {
			case 'cleaner':
				data = result.value!.cleaner;
				break;
			case 'recipes':
				data = result.value!.buildingRecipes;
				break;
		}

		if (input.value.trim().length > 0) {
			return data.filter((e) => {
				return !!e.name?.toLowerCase().includes(input.value.toLowerCase());
			});
		}

		return data;
	});

	const show = ref(all.value.slice(0, 7));
	function onLoadMore() {
		// @ts-ignore
		show.value.push(...all.value.slice(show.value.length, show.value.length + 1));
	}

	watch(
		() => {
			return [input.value];
		},
		async () => {
			await nextTick();
			show.value = all.value.slice(0, 7);
		}
	);

	const itemDatas = computed(() => {
		const rows: {
			Information: string;
			Value: any;
		}[] = [
			{
				Information: 'Power Consumption / Production',
				Value: result.value!.powerConsume
			}
		];

		if (result.value!.subCategory) {
			rows.unshift({
				Information: 'Sub Category',
				Value: result.value!.subCategory
			});
		}

		if (result.value!.category) {
			rows.unshift({
				Information: 'Category',
				Value: result.value!.category
			});
		}

		return rows;
	});
</script>

<template>
	<div class="flex h-full w-full flex-col overflow-hidden">
		<DataPageHeader v-bind="{ ...headerData, description: '' }" />
		<UHorizontalNavigation
			:links="navigation"
			:active="navigation.findIndex((e) => e.param === params.page)"
			class="border-b border-gray-200 dark:border-gray-800" />

		<div v-if="!params.page" class="flex flex-col gap-2 overflow-auto p-2">
			<UAlert
				icon="i-heroicons-information-circle"
				color="primary"
				variant="subtle"
				title="In the future, users will have the ability to add more information about an item
					or a building. If you don't see any additional information here, it's because
					none has been provided yet.">
			</UAlert>

			<div
				v-if="!!result!.description.trim()"
				class="prose dark:prose-invert prose-slate max-w-none p-2">
				<h3>Description</h3>
				<span
					class="whitespace-break-spaces opacity-75"
					v-html="result!.description.trim()" />
			</div>
			<UDivider />
			<UTable :rows="itemDatas" />
		</div>

		<template v-if="params.page === 'schematics'">
			<div class="flex flex-col gap-2 overflow-y-auto p-2 ps-0">
				<div
					v-for="schematic of result!.schematics"
					:key="String(schematic.id)"
					class="flex h-28 flex-shrink-0 gap-2 overflow-hidden rounded border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
					<div class="h-content flex flex-col gap-2">
						<NuxtImg
							:src="`/sf${schematic.image.split('.')[0]}.png`"
							:alt="String(schematic.name)"
							class="h-24 w-24 rounded border border-slate-700 bg-slate-800 p-2"
							width="128"
							placeholder="/sf.png"
							height="128" />
						<div class="flex-1" />
					</div>
					<div class="flex flex-1 flex-col overflow-hidden">
						<div class="flex items-start p-2 text-lg font-bold">
							<span class="flex-1 text-lg">
								{{ schematic.name }} ({{ getSchematicSuffic(schematic) }})
							</span>
							<span class="text-sm font-normal text-gray-500 dark:text-gray-400">
								{{ schematic.time }} seconds
							</span>
						</div>
						<div class="grid grid-cols-3 grid-rows-1 items-center p-2">
							<div class="flex items-center gap-1 text-sm">
								<Icon
									name="heroicons:hand-raised"
									class="text-primary font-semibold" />
								Handslots:
								<span class="text-emerald-600">{{
									schematic.hand_slots ?? 0
								}}</span>
							</div>

							<div class="flex items-center gap-1 text-sm">
								<Icon
									name="heroicons:archive-box"
									class="text-primary font-semibold" />
								Inventory Slots:
								<span class="text-emerald-600">{{
									schematic.inventory_slots ?? 0
								}}</span>
							</div>

							<div class="flex justify-end">
								<UButton
									icon="i-heroicons-information-circle"
									:to="{
										name: 'show-id',
										params: {
											id: blueprintPathToShort(schematic.path)
										}
									}">
									Details
								</UButton>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>

		<template v-if="params.page === 'cleaner' || params.page === 'recipes'">
			<UInput
				ref="inputRef"
				v-model="input"
				color="gray"
				variant="outline"
				class="my-1"
				placeholder="Search...">
				<template #trailing>
					<span class="text-xs text-gray-500 dark:text-gray-400">
						<UIcon name="i-heroicons-magnifying-glass" />
					</span>
				</template>
			</UInput>
			<div
				v-infinite-scroll="[onLoadMore, { distance: 500 }]"
				class="flex flex-col gap-2 overflow-y-auto p-2 ps-0">
				<template v-for="data in show" :key="String(data.path)">
					<DataRecipe
						v-if="!result!.isCleaner"
						:schematics="(data as any).schematicUnlocks"
						:data="data as any"
						class="flex-shrink-0" />
					<DataSchematicCleaner
						v-else
						:schematics="(data as any).schematicUnlocks"
						:data="data as any"
						class="flex-shrink-0" />
				</template>
				<!--<DataItemCostSlot :data="data" />-->
			</div>
		</template>
	</div>
</template>
