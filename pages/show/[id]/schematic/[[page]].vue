<script lang="ts" setup>
	const { params } = useParams({
		id: String(),
		page: String('information')
	});
	const { data: result } = await useFetch(`/api/data/${params.id}/schematic`);

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
				label: 'Schematic Informations',
				to: `/show/${params.id}/schematic`
			}
		];

		if (result.value?.recipes.length) {
			navigation.push({
				label: `Schematic Recipes (${result.value?.recipes.length})`,
				to: `/show/${params.id}/schematic/recipes`
			});
		}

		// TODO: rename Cleaner!
		if (result.value?.cleaner.length) {
			navigation.push({
				label: `Cleaner (${result.value?.cleaner.length})`,
				to: `/show/${params.id}/schematic/cleaner`
			});
		}

		return navigation;
	});

	const datas = computed(() => {
		const rows: {
			Information: string;
			Value: any;
		}[] = [
			{
				Information: 'Can Unlocked In',
				Value: getSchematicSuffic(result.value!)
			},
			{
				Information: 'Handslots',
				Value: result.value!.handSlots
			},
			{
				Information: 'Inventory Slots',
				Value: result.value!.inventorySlots
			},
			{
				Information: 'Unlock Time',
				Value: `${result.value!.time} seconds`
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
	<div class="flex flex-col gap-2">
		<DataPageHeader v-bind="headerData" />
		<UHorizontalNavigation
			:links="navigation"
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
				v-if="!!headerData.description.trim()"
				class="prose dark:prose-invert prose-slate max-w-none p-2">
				<h3>Description</h3>
				<span class="whitespace-break-spaces opacity-75" v-html="headerData.description" />
			</div>

			<h2 class="mb-2 mt-3 flex items-center gap-2 text-3xl">
				<Icon name="heroicons:inbox-stack-16-solid" class="h-8 w-8" />
				Schematic Costs
			</h2>
			<UDivider />
			<div class="flex gap-2 overflow-auto">
				<ItemsItemDisplay
					v-for="item of result!.costs"
					:key="item.shortPath"
					:item="{
						path: item.shortPath,
						name: item.name,
						image: item.image,
						form: item.form
					}"
					:amount="item.amount" />
			</div>

			<template v-if="!!result!.scanners.length">
				<h2 class="mb-2 mt-3 flex items-center gap-2 text-3xl">
					<Icon name="heroicons:wifi" class="h-8 w-8" />
					Resource Scanner Unlocks
				</h2>
				<UDivider />
				<div class="flex gap-2 overflow-auto">
					<ItemsItemDisplay
						v-for="item of result!.scanners"
						:key="item.shortPath"
						:item="{
							path: item.shortPath,
							name: item.name,
							image: item.image,
							form: item.form
						}" />
				</div>
			</template>

			<UDivider />
			<UTable :rows="datas" />
		</div>

		<template v-if="params.page === 'recipes'">
			<div ref="elProduced" class="flex flex-col gap-2 overflow-y-auto p-2 ps-0">
				<DataRecipe
					v-for="recipe of result!.recipes"
					:key="recipe.id"
					:schematics="[result! as any]"
					:data="recipe"
					class="flex-shrink-0" />
			</div>
		</template>

		<template v-if="params.page === 'cleaner'">
			<div ref="elProduced" class="flex flex-col gap-2 overflow-y-auto p-2 ps-0">
				<DataSchematicCleaner
					v-for="cleaner of result!.cleaner"
					:key="cleaner.id"
					:schematics="[result! as any]"
					:data="cleaner"
					class="flex-shrink-0" />
			</div>
		</template>
	</div>
</template>
