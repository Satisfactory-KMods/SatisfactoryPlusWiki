<script lang="ts" setup>
	import type { CleanerElement, RecipeBundle } from '~/server/db/views';

	const props = defineProps({
		data: {
			type: Object as PropType<CleanerElement>,
			required: true
		}
	});

	const cleanerTime = 3.0;
	function getPerMinute({
		time,
		form,
		amount
	}: Pick<RecipeBundle['input'][0], 'time' | 'form' | 'amount'>) {
		return roundToDec((60 / time) * (form === SFItemForm.SOLID ? amount : amount / 1000), 2);
	}

	const producedIn = computed(() => {
		return [props.data.cleanerBuilding].map((pi) => {
			return {
				to: `/show/${blueprintPathToShort(pi.path)}`,
				label: pi.name,
				image: pi.image
			};
		});
	});

	const unlockedBy = computed(() => {
		return [props.data.schematicData].map((schematic) => {
			return {
				to: `/show/${blueprintPathToShort(schematic.path)}`,
				label: `${schematic.name} (${getSchematicSuffic(schematic)})`,
				image: schematic.image
			};
		});
	});

	const inputs = computed(() => {
		const values: (ItemDisplay & { time: number; amount: number })[] = [];

		values.push({
			...props.data.inFluid,
			amount: props.data.inAmount,
			time: cleanerTime
		});

		if (props.data.filterNeed) {
			values.push({
				...props.data.filterItem,
				amount: props.data.filterAmount,
				time: parseFloat(props.data.filterTime)
			});
		}

		return values;
	});

	const outputs = computed(() => {
		const values: (ItemDisplay & { time: number; amount: number })[] = [];

		if (props.data.outFluid) {
			values.push({
				...props.data.outFluid,
				amount: props.data.outAmount,
				time: cleanerTime
			});
		}

		return values;
	});

	const waste = computed(() => {
		return props.data.byPass;
	});
</script>

<template>
	<div class="relative flex flex-shrink-0 flex-col gap-2 overflow-hidden p-0">
		<div
			class="flex flex-col overflow-hidden border bg-slate-50 dark:border-gray-700 dark:bg-gray-800">
			<h2
				class="w-full border-b bg-slate-200 p-2 text-center text-xl font-bold dark:border-gray-800 dark:bg-gray-900">
				{{ $props.data.name }}
			</h2>
		</div>

		<div class="grid grid-cols-4 grid-rows-1 gap-3 overflow-hidden">
			<div
				class="col-span-2 flex flex-col overflow-hidden border bg-slate-50 dark:border-gray-700 dark:bg-gray-800">
				<h2
					class="w-full border-b bg-slate-200 p-2 text-center text-xl font-bold dark:border-gray-800 dark:bg-gray-900">
					Fluid Processing
				</h2>
				<div class="flex items-center gap-2 overflow-auto p-1 font-bold">
					<div class="relative flex items-center gap-2 overflow-auto p-1">
						<template v-for="item of inputs" :key="item.path">
							<ItemsItemDisplay
								v-if="item.path"
								:item="item"
								:amount="item.amount"
								:per-minute="getPerMinute(item)" />
						</template>
					</div>

					<Icon name="radix-icons:triangle-right" class="flex-1 text-5xl" />

					<div class="relative flex items-center gap-2 overflow-auto p-1">
						<template v-for="item of outputs" :key="item.path">
							<ItemsItemDisplay
								v-if="item.path"
								:item="item"
								:amount="item.amount"
								:per-minute="getPerMinute(item)" />
						</template>
					</div>
				</div>
			</div>

			<div
				class="flex flex-1 flex-col overflow-hidden border bg-slate-50 dark:border-gray-700 dark:bg-gray-800">
				<h2
					class="w-full border-b bg-slate-200 p-2 text-center text-xl font-bold dark:border-gray-800 dark:bg-gray-900">
					Unlocked In
				</h2>
				<div class="flex items-center justify-center gap-2 overflow-auto p-1 font-bold">
					<CommonDisplayBox v-for="pi in unlockedBy" :key="pi.label" :item="pi" />
				</div>
			</div>

			<div
				class="flex flex-1 flex-col overflow-hidden border bg-slate-50 dark:border-gray-700 dark:bg-gray-800">
				<h2
					class="w-full border-b bg-slate-200 p-2 text-center text-xl font-bold dark:border-gray-800 dark:bg-gray-900">
					Produced In
				</h2>
				<div class="flex items-center justify-center gap-2 overflow-auto p-1 font-bold">
					<CommonDisplayBox v-for="pi in producedIn" :key="pi.label" :item="pi" />
				</div>
			</div>
		</div>

		<div
			class="flex flex-1 flex-shrink-0 flex-col overflow-hidden border bg-slate-50 dark:border-gray-700 dark:bg-gray-800">
			<h2
				class="w-full border-b bg-slate-200 p-2 text-center text-xl font-bold dark:border-gray-800 dark:bg-gray-900">
				Waste Products
			</h2>

			<div
				class="relative flex h-fit w-full flex-shrink-0 items-center gap-1 overflow-auto p-1">
				<template v-for="item of waste" :key="item.path">
					<ItemsItemDisplay
						v-if="item.path"
						class="flex-shrink-0"
						:item="item"
						:amount="item.amount"
						:per-minute="getPerMinute(item as any)" />
				</template>
			</div>
		</div>

		<UDivider class="my-3" />
	</div>
</template>
