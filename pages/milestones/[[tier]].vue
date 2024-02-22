<script lang="ts" setup>
	const route = useRoute();
	const tier = computed(() => {
		const { tier } = (route.params as { tier: string }) ?? {};
		if (typeof tier === 'string') {
			return parseInt(tier.split('-')[1] ?? '1');
		}
		return 1;
	});

	const { data } = await useFetch(`/api/milestones/${tier.value}`);
</script>

<template>
	<div class="flex w-full flex-col flex-nowrap gap-2 py-2">
		<div
			v-for="schematic of data ?? []"
			:key="String(schematic.short)"
			class="flex flex-shrink-0 gap-2 overflow-hidden rounded border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
			<div class="flex flex-col gap-2">
				<NuxtImg
					:src="`/sf${schematic.image.split('.')[0]}.png`"
					:alt="String(schematic.name)"
					class="h-24 w-24 rounded border border-slate-700 bg-slate-800 p-2"
					width="128"
					placeholder="/sf.png"
					height="128" />
				<div class="flex-1" />
				<UButton
					icon="i-heroicons-information-circle"
					:to="{
						name: 'show-id',
						params: {
							id: String(schematic.short)
						}
					}">
					Details
				</UButton>
			</div>
			<div class="flex flex-1 flex-col gap-1 overflow-hidden">
				<div class="flex flex-col gap-1">
					<div class="flex items-center text-lg font-bold">
						<span class="flex-1 text-lg">
							{{ schematic.name }}
						</span>
						<span class="text-sm font-normal text-gray-500 dark:text-gray-400">
							{{ schematic.time }} seconds
						</span>
					</div>
					<div class="grid grid-cols-2 grid-rows-2 items-center gap-3">
						<div class="flex items-center gap-1 text-sm">
							<Icon name="heroicons:book-open" class="text-primary font-semibold" />
							Recipes:
							<span class="text-emerald-600">{{ schematic.recipeCount ?? 0 }}</span>
						</div>

						<div class="flex items-center gap-1 text-sm">
							<Icon name="heroicons:hand-raised" class="text-primary font-semibold" />
							Handslots:
							<span class="text-emerald-600">{{ schematic.handslots ?? 0 }}</span>
						</div>

						<div class="flex items-center gap-1 text-sm">
							<Icon name="heroicons:archive-box" class="text-primary font-semibold" />
							Inventory Slots:
							<span class="text-emerald-600">{{
								schematic.inventorySlots ?? 0
							}}</span>
						</div>

						<div class="flex items-center gap-1 text-sm">
							<Icon name="heroicons:wifi" class="text-primary font-semibold" />
							Resource Scanns:
							<span class="text-emerald-600">{{
								schematic.scannerUnlockCount ?? 0
							}}</span>
						</div>
					</div>
				</div>
				<div class="flex flex-nowrap gap-2 overflow-auto border-t p-2">
					<ItemsItemDisplay
						v-for="cost of schematic.costs"
						:key="cost.item_path"
						:item="{
							name: String(cost.name),
							image: String(cost.image),
							path: cost.item_path,
							form: cost.form ?? SFItemForm.SOLID
						}"
						:amount="cost.amount" />
				</div>
			</div>
		</div>
	</div>
</template>
