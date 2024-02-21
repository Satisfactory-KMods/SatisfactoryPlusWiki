<script lang="ts" setup>
	const { params } = useParams({
		category: String(),
		subCategory: String()
	});

	const { data: mainCategories } = await useFetch('/api/milestones/shop');

	const category = computed(() => {
		return (
			(mainCategories.value ?? []).find((category) => {
				return category.category === params.category;
			})?.category ??
			mainCategories.value?.at(0)?.category ??
			''
		);
	});

	const { data: categories } = await useFetch(`/api/milestones/shop/category/${category.value}`);

	const navigation = computed(() => {
		return (categories.value ?? []).map((category) => {
			return {
				label: `${category.subCategory}`,
				to: `/awsome-shop/${category.category}/${category.subCategory}`
			};
		});
	});

	const milestones = computed(() => {
		return (params.subCategory ? categories.value?.find((category) => {
			return category.subCategory ===  params.subCategory;
		}) : categories.value?.at(0)) ?? null;
	});
</script>

<template>
	<div class="flex gap-2 py-2">
		<UVerticalNavigation :links="navigation" class="min-w-[200px]" />
		<div v-if="milestones" class="flex flex-1 flex-col gap-2">
			<NuxtLink
				v-for="schematic of milestones.milestones ?? []"
				:key="String(schematic.short)"
				:to="{
					name: 'show-id',
					params: {
						id: String(schematic.short)
					}
				}"
				class="flex cursor-pointer items-center gap-2 overflow-hidden rounded border bg-gray-50 p-2 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 hover:dark:bg-gray-900">
				<NuxtImg
					:src="`/sf${schematic.image.split('.')[0]}.png`"
					:alt="String(schematic.name)"
					class="h-24 w-24 rounded border border-slate-700 bg-slate-800 p-2"
					width="128"
					placeholder="/sf.png"
					height="128" />
				<div class="flex flex-1 flex-col gap-1 overflow-hidden">
					<div class="flex flex-col gap-1">
						<div class="flex items-center text-lg font-bold">
							<span class="flex-1 text-lg">
								{{ schematic.name }}
							</span>
						</div>
					</div>
				</div>
				<div class="flex flex-nowrap gap-2 overflow-auto">
					<ItemsItemDisplay
						v-for="cost of schematic.costs"
						:key="cost.item_path"
						:item="{
							name: String(cost.name),
							image: String(cost.image),
							path: cost.item_path,
							form: cost.form ?? SFItemForm.SOLID
						}"
						image-size="40"
						:amount="cost.amount" />
				</div>
			</NuxtLink>
		</div>
	</div>
</template>
