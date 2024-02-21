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
			statusMessage: 'Page Not Found',
			fatal: true
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
		if (item.item_type_information.type === 'slug' && spoilerMode.active) {
			return {
				title: item.item_type_information.hiddenName,
				description: replaceFromRecord(item.item_type_information.hiddenDescription, {
					OtherSlugs: item.item_type_information.comfortableWith
						.map((slug) => {
							return slug.name;
						})
						.join(', '),
					FoodTierNum: `${item.item_type_information.foodTier} (${item.item_type_information.food.name})`
				}),
				image: result.value!.items.image
			};
		} else if (item.item_type_information.type === 'egg' && spoilerMode.active) {
			return {
				title: item.item_type_information.hiddenName,
				description: replaceFromRecord(item.item_type_information.hiddenDescription, {
					HatchingTime: item.item_type_information.hatchingTime,
					MinHeat: item.item_type_information.minHeat,
					MaxHeat: item.item_type_information.maxHeat,
					MinHumidity: uePercentToPercent(item.item_type_information.minHumidity),
					MaxHumidity: uePercentToPercent(item.item_type_information.maxHumidity),
					SlugTime: slugDayTimeToString(item.item_type_information.dayTime),
					IsFluidConsume: item.item_type_information.fluid
						? item.item_type_information.fluid.name
						: 'No',
					IncubatorTier: item.item_type_information.incubatorTier
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
		if (item.descriptor_type === SFDescType.RESOURCE) {
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
				item.item_type_information.type === 'egg' ||
				item.item_type_information.type === 'slug'
		};
	});

	const schematics = computed(() => {
		return result.value?.items.used_in_schematics ?? [];
	});

	const produced = computed(() => {
		return (
			result.value?.extraInformations?.produced_in.filter((e) => {
				return !e.buildingRecipe;
			}) ?? []
		);
	});

	const buildables = computed(() => {
		return (
			result.value?.extraInformations?.produced_in.filter((e) => {
				return !!e.buildingRecipe;
			}) ?? []
		);
	});

	const cleaners = computed(() => {
		return result.value?.viewCleanerItemMapping ?? [];
	});

	const consumed = computed(() => {
		return (
			(result.value?.extraInformations?.consumed_in ?? []).filter((e) => {
				return !e.isAlternate;
			}) ?? []
		);
	});

	const alternateRecipes = computed(() => {
		return (
			(result.value?.extraInformations?.consumed_in ?? []).filter((e) => {
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

		if (cleaners.value.length) {
			navigation.push({
				// TODO: RENAME
				label: `Cleaner Recipes (${cleaners.value.length})`,
				to: `/show/${params.id}/itemDescriptor/cleaner`
			});
		}

		if (buildables.value.length) {
			navigation.push({
				label: `Buildings (${buildables.value.length})`,
				to: `/show/${params.id}/itemDescriptor/buildables`
			});
		}

		if (schematics.value.length) {
			navigation.push({
				label: `Need for Schematics (${schematics.value.length})`,
				to: `/show/${params.id}/itemDescriptor/need-for-schematics`
			});
		}

		return navigation;
	});

	const input = ref('');
	const all = computed(() => {
		let data: ItemDataResult['extraInformations']['produced_in'] = [];
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
				Value: result.value!.items.can_delete ? 'Yes' : 'No'
			},
			{
				Information: 'Can be Sinked',
				Value: result.value!.items.can_be_sink ? 'Yes' : 'No'
			},
			{
				Information: 'Sink Points',
				Value: result.value!.items.sink_points
			},
			{
				Information: 'Is Radioactive',
				Value: result.value!.items.radio_active ? 'Yes' : 'No'
			},
			{
				Information: 'Stack Size',
				Value:
					result.value!.items.form === SFItemForm.SOLID
						? result.value!.items.stack_size
						: result.value!.items.stack_size / 1000
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
							'background-color': `#${result?.items.gas_color}`
						}"
						@click="copyColor(result?.items.gas_color ?? '')">
						<div class="flex items-center gap-2 text-xs text-white">
							<Icon name="heroicons:clipboard-document" />
							#{{ result?.items.gas_color }}
						</div>
					</div>
				</div>
				<div
					class="flex flex-1 items-center gap-2 rounded border p-2 dark:border-slate-700 dark:bg-slate-800">
					<span class="flex-1 text-lg font-bold">Fluid Color</span>
					<div
						class="flex h-8 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded border text-center text-white dark:border-slate-600"
						:style="{
							'background-color': `#${result?.items.fluid_color}`
						}"
						@click="copyColor(result?.items.fluid_color ?? '')">
						<div class="flex items-center gap-2 text-xs text-white">
							<Icon name="heroicons:clipboard-document" />
							#{{ result?.items.fluid_color }}
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

		<div v-if="params.page === 'cleaner'" class="flex flex-col gap-2 overflow-auto pe-2">
			<DataSchematicCleaner
				v-for="cleaner of cleaners"
				:key="cleaner.id"
				:schematics="[result! as any]"
				:data="cleaner"
				class="flex-shrink-0" />
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
				v-infinite-scroll="[onLoadMore, { distance: 500 }]"
				class="flex flex-col gap-2 overflow-y-auto p-2 ps-0">
				<DataItemCostSlot v-for="(data, idx) in show" :key="idx" :data="data" />
			</div>
		</template>

		<template v-if="params.page === 'need-for-schematics'">
			<div class="flex flex-col gap-2 overflow-y-auto p-2 ps-0">
				<div
					v-for="schematic of schematics"
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
								<span class="text-emerald-600">{{ schematic.handSlots ?? 0 }}</span>
							</div>

							<div class="flex items-center gap-1 text-sm">
								<Icon
									name="heroicons:archive-box"
									class="text-primary font-semibold" />
								Inventory Slots:
								<span class="text-emerald-600">{{
									schematic.inventorySlots ?? 0
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
	</div>
</template>
