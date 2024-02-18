<script lang="ts" setup>
	import type { ItemDataResult } from '~/server/api/data/[shortPath]/item.get';

	const props = defineProps({
		data: {
			type: Object as PropType<ItemDataResult['extra_informations']['produced'][0]>,
			required: true
		}
	});

	function getPerMinute(
		item:
			| ItemDataResult['extra_informations']['produced'][0]['output'][0]
			| ItemDataResult['extra_informations']['produced'][0]['input'][0]
	) {
		if (props.data.buildingRecipe) {
			return undefined;
		}
		return roundToDec((60 / item.time) * item.amount, 2);
	}

	const producedIn = computed(() => {
		if (props.data.productionElement?.type === 'recipe') {
			console.log(props.data.productionElement.data);
			return props.data.productionElement.data.producedIn.at(0)?.name ??
				props.data.buildingRecipe
				? 'Build Gun'
				: 'Unknown Location';
		}
		return props.data.buildingRecipe ? 'Build Gun' : 'Unknown Location';
	});

	const unlockedBy = computed(() => {
		return props.data.schematics
			.map((schematic) => {
				return schematic.name;
			})
			.join(', ');
	});
</script>

<template>
	<div
		class="relative flex flex-shrink-0 flex-col gap-2 overflow-hidden rounded border bg-gray-50 p-2 dark:border-slate-700 dark:bg-slate-800">
		<h2 class="text-xl font-bold">
			{{ $props.data.productionElement?.data.name ?? 'Unknown Recipe' }}
		</h2>

		<div class="absolute right-2 top-2 flex gap-2">
			<span class="text-lg font-bold opacity-75">{{ producedIn }} </span>
		</div>

		<div class="relative flex w-full items-center gap-2 overflow-hidden">
			<div class="relative flex w-full flex-1 items-center gap-2 overflow-auto py-2">
				<template v-for="item of $props.data.input" :key="item.item.path">
					<ItemsItemDisplay
						v-if="item.item.path"
						:item="item.item"
						:amount="item.amount"
						:per-minute="getPerMinute(item)" />
				</template>
			</div>

			<Icon name="radix-icons:triangle-right" class="text-5xl" />

			<div class="relative flex w-full flex-1 items-center gap-2 overflow-auto py-2">
				<template v-for="item of $props.data.output" :key="item.item.path">
					<ItemsItemDisplay
						v-if="item.item.path"
						:item="item.item"
						:amount="$props.data.buildingRecipe ? undefined : item.amount"
						:per-minute="getPerMinute(item)" />
				</template>
			</div>
			{{ unlockedBy }}
		</div>
	</div>
</template>
