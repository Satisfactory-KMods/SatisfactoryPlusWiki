<script lang="ts" setup>
	import type { ItemDataResult } from '~/server/api/data/[shortPath]/item.get';

	const props = defineProps({
		item: {
			type: Object as PropType<ItemDataResult>,
			required: true
		}
	});

	const itemTypeInfo = computed(() => {
		return props.item.items.item_type_information;
	});
</script>

<template>
	<div
		v-show="itemTypeInfo.type !== 'normal'"
		class="table w-full table-auto border bg-slate-100 dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-800">
		<div class="table-row-group bg-white dark:bg-slate-800">
			<!-- MINER / ORE -->
			<template v-if="itemTypeInfo.type === 'miner' && item.items.form === SFItemForm.SOLID">
				<div class="table-row">
					<div
						class="table-cell border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
						Required Modules
					</div>
					<div
						class="table-cell w-[60%] border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
						<div class="flex w-full flex-nowrap gap-2 overflow-auto">
							<ItemsItemDisplay
								v-for="i of itemTypeInfo.neededModules"
								:key="i.buildingPath"
								:item="i" />
						</div>
					</div>
				</div>

				<div v-if="!!itemTypeInfo.preventModules.length" class="table-row">
					<div
						class="table-cell gap-2 border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
						Prevented Modules
					</div>
					<div
						class="table-cell w-[60%] border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
						<div class="flex w-full flex-nowrap gap-2 overflow-auto">
							<ItemsItemDisplay
								v-for="i of itemTypeInfo.preventModules"
								:key="i.buildingPath"
								:item="i" />
						</div>
					</div>
				</div>

				<div class="table-row">
					<div
						class="table-cell border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
						Allowed Fluids or Gasses <br />
						Impure: 50% <br />
						Normal: 100% <br />
						Pure: 200% <br />
						Consume is on 100% (normal node)
					</div>
					<div
						class="w-[[6%] table-cell border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
						<div class="flex w-full flex-nowrap gap-2 overflow-auto">
							<ItemsItemDisplay
								v-for="i of itemTypeInfo.fluidInfos"
								:key="i.path.path"
								:item="i.path"
								:amount="i.normalFluidCountPerSecond"
								:per-minute="(i.normalFluidCountPerSecond * 60) / 1000">
								<template #extra>
									{{ i.productionTimeMulti * 100 }}% Boost
								</template>
							</ItemsItemDisplay>
						</div>
					</div>
				</div>

				<div v-if="!!itemTypeInfo.modulInformation.length" class="table-row">
					<div
						class="table-cell border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
						Production Module <br />
						Replace production per output <br />
						And has a additional waste output
					</div>
					<div
						class="table-cell w-[60%] border-b border-slate-100 p-4 pl-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
						<div class="flex w-full flex-col flex-nowrap gap-2 overflow-auto">
							<div v-for="i of itemTypeInfo.modulInformation" :key="i.path.path">
								123
							</div>
						</div>
					</div>
				</div>
			</template>

			<!-- EGGI! -->
			<template v-if="itemTypeInfo.type === 'egg'"></template>

			<!-- SLUG -->
			<template v-if="itemTypeInfo.type === 'slug'"></template>
		</div>
	</div>
</template>
