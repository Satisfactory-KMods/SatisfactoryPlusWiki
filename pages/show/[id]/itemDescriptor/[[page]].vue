<script lang="ts" setup>
	import { useSpoilerMode } from '~/stores/useSpoilerMode';
	import {
		SFItemFormToString,
		slugDayTimeToString,
		uePercentToPercent
	} from '~/utils/satisfactoryExtractorTypes';
	import { replaceFromRecord, vInfiniteScroll } from '~/utils/utils';
	import type { ItemDataResult } from '~/server/api/data/[shortPath]/item.get';

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

	definePageMeta({
		layout: 'default-no-scroll'
	});

	useHeadSafe({
		title: result.value.items.name
	});

	const spoilerMode = useSpoilerMode();

	const spoilerData = computed(() => {
		const item = result.value!.items;
		if (item.itemTypeInformation.type === 'slug' && spoilerMode.active) {
			return {
				title: item.itemTypeInformation.hiddenName,
				description: replaceFromRecord(item.itemTypeInformation.hiddenDescription, {
					OtherSlugs: item.itemTypeInformation.comfortableWith
						.map((slug) => {
							return slug.name;
						})
						.join(', '),
					FoodTierNum: `${item.itemTypeInformation.foodTier} (${item.itemTypeInformation.food.name})`
				}),
				image: result.value!.items.image
			};
		} else if (item.itemTypeInformation.type === 'egg' && spoilerMode.active) {
			return {
				title: item.itemTypeInformation.hiddenName,
				description: replaceFromRecord(item.itemTypeInformation.hiddenDescription, {
					HatchingTime: item.itemTypeInformation.hatchingTime,
					MinHeat: item.itemTypeInformation.minHeat,
					MaxHeat: item.itemTypeInformation.maxHeat,
					MinHumidity: uePercentToPercent(item.itemTypeInformation.minHumidity),
					MaxHumidity: uePercentToPercent(item.itemTypeInformation.maxHumidity),
					SlugTime: slugDayTimeToString(item.itemTypeInformation.dayTime),
					IsFluidConsume: item.itemTypeInformation.fluid
						? item.itemTypeInformation.fluid.name
						: 'No',
					IncubatorTier: item.itemTypeInformation.incubatorTier
				}),
				image: result.value!.items.image
			};
		}
		return {
			title: result.value!.items.name,
			description: result.value!.items.description,
			image: result.value!.items.image
		};
	});

	const headerData = computed(() => {
		const item = result.value!.items;
		let mapLink;
		if (item.descriptorType === SFDescType.RESOURCE) {
			const mapData = [
				[
					item.path,
					[
						SFResourceNodePurity.impure,
						SFResourceNodePurity.loot,
						SFResourceNodePurity.normal,
						SFResourceNodePurity.pickup,
						SFResourceNodePurity.pure,
						SFResourceNodePurity.wellCore
					],
					SFResourceNodeType.resourceNodes
				],

				[
					item.path,
					[
						SFResourceNodePurity.impure,
						SFResourceNodePurity.loot,
						SFResourceNodePurity.normal,
						SFResourceNodePurity.pickup,
						SFResourceNodePurity.pure,
						SFResourceNodePurity.wellCore
					],
					'other'
				],

				...(item.form !== SFItemForm.SOLID
					? [
							[
								item.path,
								[
									SFResourceNodePurity.impure,
									SFResourceNodePurity.loot,
									SFResourceNodePurity.normal,
									SFResourceNodePurity.pickup,
									SFResourceNodePurity.pure,
									SFResourceNodePurity.wellCore
								],
								SFResourceNodeType.resourceWells
							]
						]
					: [])
			];

			mapLink = `/map?sel=${encodeURIComponent(JSON.stringify(mapData))}`;
		}
		return {
			...spoilerData.value,
			mapLink,
			useSpoiler:
				item.itemTypeInformation.type === 'egg' || item.itemTypeInformation.type === 'slug'
		};
	});

	const produced = computed(() => {
		return (
			result.value?.extra_informations?.produced.filter((e) => {
				return !e.buildingRecipe;
			}) ?? []
		);
	});

	const buildables = computed(() => {
		return (
			result.value?.extra_informations?.produced.filter((e) => {
				return !!e.buildingRecipe;
			}) ?? []
		);
	});

	const consumed = computed(() => {
		return (
			(result.value?.extra_informations?.consumed ?? []).filter((e) => {
				return !e.isAlternate;
			}) ?? []
		);
	});

	const alternateRecipes = computed(() => {
		return (
			(result.value?.extra_informations?.consumed ?? []).filter((e) => {
				return e.isAlternate;
			}) ?? []
		);
	});

	const navigation = computed(() => {
		const navigation = [
			{
				label: 'Item Informations',
				to: `/show/${params.id}/itemDescriptor`
			}
		];

		if (consumed.value.length) {
			navigation.push({
				label: `Recipes (${consumed.value.length})`,
				to: `/show/${params.id}/itemDescriptor/consumed-from`
			});
		}

		if (alternateRecipes.value.length) {
			navigation.push({
				label: `Alternate Recipes (${alternateRecipes.value.length})`,
				to: `/show/${params.id}/itemDescriptor/alternate-recipes`
			});
		}

		if (produced.value.length) {
			navigation.push({
				label: `Used For (${produced.value.length})`,
				to: `/show/${params.id}/itemDescriptor/produced-by`
			});
		}

		if (buildables.value.length) {
			navigation.push({
				label: `Buildings (${buildables.value.length})`,
				to: `/show/${params.id}/itemDescriptor/buildables`
			});
		}

		return navigation;
	});

	const input = ref('');
	const all = computed(() => {
		let data: ItemDataResult['extra_informations']['produced'] = [];
		switch (params.page) {
			case 'alternate-recipes':
				data = alternateRecipes.value;
				break;
			case 'produced-by':
				data = produced.value;
				break;
			case 'buildables':
				data = buildables.value;
				break;
			case 'consumed-from':
				data = consumed.value;
				break;
			default:
				return [];
		}

		if (input.value.trim().length > 0) {
			return data.filter((e) => {
				return !!e.productionElement?.data.name
					.toLowerCase()
					.includes(input.value.toLowerCase());
			});
		}
		return data;
	});
	const show = ref(all.value.slice(0, 7));
	function onLoadMore() {
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
				Information: 'Form',
				Value: SFItemFormToString(result.value!.items.form)
			},
			{
				Information: 'Can be deleted',
				Value: result.value!.items.canDelete ? 'Yes' : 'No'
			},
			{
				Information: 'Can be Sinked',
				Value: result.value!.items.canBeSink ? 'Yes' : 'No'
			},
			{
				Information: 'Sink Points',
				Value: result.value!.items.sinkPoints
			},
			{
				Information: 'Is Radioactive',
				Value: result.value!.items.radioActive ? 'Yes' : 'No'
			},
			{
				Information: 'Stack Size',
				Value:
					result.value!.items.form === SFItemForm.SOLID
						? result.value!.items.stackSize
						: result.value!.items.stackSize / 1000
			}
		];

		return rows;
	});

	const toast = useToast();
	const { copy } = useClipboard();

	function copyColor(color: string) {
		copy(`#${color}`);
		toast.add({
			title: 'Color copied',
			description: `The color #${color} has been copied to your clipboard.`
		});
	}
</script>

<template>
	<div class="flex h-full w-full flex-col overflow-hidden">
		<DataPageHeader v-bind="{ ...headerData, description: '' }" />
		<UHorizontalNavigation
			:links="navigation"
			class="border-b border-gray-200 dark:border-gray-800" />

		<div v-if="!params.page" class="flex flex-col gap-2 overflow-auto p-2">
			<div v-if="result?.items.form !== SFItemForm.SOLID" class="flex gap-3">
				<div
					class="flex flex-1 items-center gap-2 rounded border p-2 dark:border-slate-700 dark:bg-slate-800">
					<span class="flex-1 text-lg font-bold">Gas Color</span>
					<div
						class="flex h-8 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded border text-center text-white dark:border-slate-600"
						:style="{
							'background-color': `#${result?.items.gasColor}`
						}"
						@click="copyColor(result?.items.gasColor ?? '')">
						<div class="flex items-center gap-2 text-xs text-white">
							<Icon name="heroicons:clipboard-document" />
							#{{ result?.items.gasColor }}
						</div>
					</div>
				</div>
				<div
					class="flex flex-1 items-center gap-2 rounded border p-2 dark:border-slate-700 dark:bg-slate-800">
					<span class="flex-1 text-lg font-bold">Fluid Color</span>
					<div
						class="flex h-8 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded border text-center text-white dark:border-slate-600"
						:style="{
							'background-color': `#${result?.items.fluidColor}`
						}"
						@click="copyColor(result?.items.fluidColor ?? '')">
						<div class="flex items-center gap-2 text-xs text-white">
							<Icon name="heroicons:clipboard-document" />
							#{{ result?.items.fluidColor }}
						</div>
					</div>
				</div>
			</div>

			<UAlert
				icon="i-heroicons-information-circle"
				color="primary"
				variant="subtle"
				title="In the future, users will have the ability to add more information about an item
				or a building. If you don't see any additional information here, it's because
				none has been provided yet.">
			</UAlert>

			<div class="prose dark:prose-invert prose-slate max-w-none p-2">
				<h3>Description</h3>
				<span class="whitespace-break-spaces opacity-75" v-html="headerData.description" />
			</div>

			<UTable :rows="itemDatas" />
		</div>

		<template
			v-if="
				params.page === 'produced-by' ||
				params.page === 'consumed-from' ||
				params.page === 'alternate-recipes' ||
				params.page === 'buildables'
			">
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
				ref="elProduced"
				v-infinite-scroll="[onLoadMore, { distance: 500 }]"
				class="flex flex-col gap-2 overflow-y-auto p-2 ps-0">
				<DataItemCostSlot v-for="(data, idx) in show" :key="idx" :data="data" />
			</div>
		</template>
	</div>
</template>
