<script lang="ts" setup>
	const route = useRoute();
	const tree = computed(() => {
		const { tree } = (route.params as { tree: string }) ?? {};
		if (typeof tree === 'string') {
			return tree;
		}
		return null;
	});

	const { data: categories } = await useFetch('/api/research-tree/trees');
	const navigation = computed(() => {
		return (categories.value ?? []).map((category) => {
			return {
				...category,
				to: `/show/${category.shortPath}`
			};
		});
	});
</script>

<template>
	<div class="w-full">
		<div v-if="!tree" class="grid grid-cols-3 gap-2">
			<NuxtLink v-for="nav of navigation" :key="nav.to" :to="nav.to">
				<UCard>
					<template #header>
						<div class="mx-auto text-center">{{ nav.name }}</div>
					</template>

					<NuxtImg
						placeholder="/sf.png"
						:src="`/sf${nav.image.split('.')[0]}.png`"
						:alt="nav.name"
						class="mx-auto"
						width="128"
						height="128" />
				</UCard>
			</NuxtLink>
		</div>
		<NuxtPage />
	</div>
</template>
