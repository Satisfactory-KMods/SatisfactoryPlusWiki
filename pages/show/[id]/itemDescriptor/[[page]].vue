<script lang="ts" setup>
	import { useSpoilerMode } from '~/stores/useSpoilerMode';
	import { slugDayTimeToString, uePercentToPercent } from '~/utils/satisfactoryExtractorTypes';
	import { replaceFromRecord } from '~/utils/utils';

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

	const navigation = computed(() => {
		const navigation = [
			{
				label: 'Item Informations',
				to: `/show/${params.id}/itemDescriptor`
			}
		];

		if (result.value?.extra_informations?.produced?.length) {
			navigation.push({
				label: 'Produced By',
				to: `/show/${params.id}/itemDescriptor/produced-by`
			});
		}

		if (result.value?.extra_informations?.produced?.length) {
			navigation.push({
				label: 'Consumed From',
				to: `/show/${params.id}/itemDescriptor/consumed-from`
			});
		}

		return navigation;
	});
</script>

<template>
	<div class="flex flex-col gap-2">
		<DataPageHeader v-bind="headerData" />
		<UHorizontalNavigation
			:links="navigation"
			class="border-b border-gray-200 dark:border-gray-800" />

		<div v-if="!params.page" class="flex flex-col gap-2">
			<UAlert
				icon="i-heroicons-information-circle"
				color="primary"
				variant="subtle"
				title="Feature not implemented">
				<template #description>
					In the future, users will have the ability to add more information about an item
					or a building. If you don't see any additional information here, it's because
					none has been provided yet.
				</template>
			</UAlert>
		</div>

		<div v-if="params.page === 'produced-by'" class="flex flex-col gap-2">
			<DataItemCostSlot
				v-for="(data, idx) in result!.extra_informations.consumed"
				:key="idx"
				:data="data" />
		</div>

		<div v-if="params.page === 'consumed-from'" class="flex flex-col gap-2">
			<DataItemCostSlot
				v-for="(data, idx) in result!.extra_informations.produced"
				:key="idx"
				:data="data" />
		</div>
	</div>
</template>
