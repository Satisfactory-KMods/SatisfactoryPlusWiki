<script lang="ts" setup>
	import type { ItemDataResult } from '~/server/api/data/[shortPath]/item.get';

	const props = defineProps({
		data: {
			type: Object as PropType<ItemDataResult['extraInformations']['produced_in'][0]>,
			required: true
		}
	});

	function getPerMinute(
		item:
			| ItemDataResult['extraInformations']['produced_in'][0]['output'][0]
			| ItemDataResult['extraInformations']['produced_in'][0]['input'][0]
	) {
		if (props.data.buildingRecipe) {
			return undefined;
		}
		return roundToDec(
			(60 / item.time) *
				(item.item.form === SFItemForm.SOLID ? item.amount : item.amount / 1000),
			2
		);
	}

	const producedIn = computed(() => {
		if (props.data.productionElement?.type === 'recipe') {
			return props.data.productionElement.data?.producedIn?.length > 0
				? props.data.productionElement.data?.producedIn?.map((pi) => {
						return {
							to: `/show/${blueprintPathToShort(pi.path)}`,
							label: pi.name,
							image: pi.image
						};
					})
				: [
						{
							to: null,
							label: props.data.buildingRecipe ? 'Build Gun' : 'Unknown Location',
							image: null
						}
					];
		}
		return [
			{
				to: null,
				label: props.data.buildingRecipe ? 'Build Gun' : 'Unknown Location',
				image: null
			}
		];
	});

	const unlockedBy = computed(() => {
		return props.data.schematics
			.filter((s) => {
				return !!s;
			})
			.map((schematic) => {
				return {
					to: `/show/${blueprintPathToShort(schematic.path)}`,
					label: `${schematic.name} (${getSchematicSuffic(schematic)})`,
					image: schematic.image
				};
			});
	});
</script>

<template>
	<div class="relative flex flex-shrink-0 flex-col gap-2 overflow-hidden p-0">
		<div
			class="flex flex-1 flex-col overflow-hidden border bg-slate-50 dark:border-gray-700 dark:bg-gray-800">
			<h2
				class="w-full border-b bg-slate-200 p-2 text-center text-xl font-bold dark:border-gray-800 dark:bg-gray-900">
				{{ $props.data.productionElement?.data.name ?? 'Unknown Recipe' }}
			</h2>

			<div class="relative flex w-full items-center gap-2 overflow-hidden">
				<div class="relative flex w-full flex-1 items-center gap-2 overflow-auto p-1">
					<template v-for="item of $props.data.input" :key="item.item.path">
						<ItemsItemDisplay
							v-if="item.item.path"
							:item="item.item"
							:amount="item.amount"
							:per-minute="getPerMinute(item)" />
					</template>
				</div>

				<Icon name="radix-icons:triangle-right" class="text-5xl" />

				<div class="relative flex w-full flex-1 items-center gap-2 overflow-auto p-1">
					<template v-for="item of $props.data.output" :key="item.item.path">
						<ItemsItemDisplay
							v-if="item.item.path"
							:item="item.item"
							:amount="$props.data.buildingRecipe ? undefined : item.amount"
							:per-minute="getPerMinute(item)" />
					</template>
				</div>
			</div>
		</div>

		<div class="flex gap-3 overflow-hidden">
			<div
				class="flex flex-1 flex-col overflow-hidden border bg-slate-50 dark:border-gray-700 dark:bg-gray-800">
				<h2
					class="w-full border-b bg-slate-200 p-2 text-center text-xl font-bold dark:border-gray-800 dark:bg-gray-900">
					Produced In
				</h2>
				<div class="flex gap-2 overflow-auto p-1 font-bold">
					<CommonDisplayBox v-for="pi in producedIn" :key="pi.label" :item="pi" />
				</div>
			</div>

			<div
				class="flex flex-1 flex-col overflow-hidden border bg-slate-50 dark:border-gray-700 dark:bg-gray-800">
				<h2
					class="w-full border-b bg-slate-200 p-2 text-center text-xl font-bold dark:border-gray-800 dark:bg-gray-900">
					Unlocked In
				</h2>
				<div class="flex gap-2 overflow-auto p-1 font-bold">
					<CommonDisplayBox v-for="pi in unlockedBy" :key="pi.label" :item="pi" />
				</div>
			</div>
		</div>

		<UDivider class="my-3" />
	</div>
</template>
