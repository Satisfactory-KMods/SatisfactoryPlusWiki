<script lang="ts" setup>
	const tiers = ref([
		{
			tier: 0,
			label: 'Tutorial',
			to: '/milestones/tier-0'
		},
		{
			tier: 1,
			label: 'Tier 1',
			to: '/milestones'
		},
		{
			tier: 2,
			label: 'Tier 2',
			to: '/milestones/tier-2'
		},
		{
			tier: 3,
			label: 'Tier 3',
			to: '/milestones/tier-3'
		},
		{
			tier: 4,
			label: 'Tier 4',
			to: '/milestones/tier-4'
		},
		{
			tier: 5,
			label: 'Tier 5',
			to: '/milestones/tier-5'
		},
		{
			tier: 6,
			label: 'Tier 6',
			to: '/milestones/tier-6'
		},
		{
			tier: 7,
			label: 'Tier 7',
			to: '/milestones/tier-7'
		},
		{
			tier: 8,
			label: 'Tier 8',
			to: '/milestones/tier-8'
		}
	]);

	const route = useRoute();
	const tier = computed(() => {
		const { tier } = (route.params as { tier: string }) ?? {};
		if (typeof tier === 'string') {
			return parseInt(tier.split('-')[1] ?? '1');
		}
		return 1;
	});
</script>

<template>
	<div>
		<UHorizontalNavigation
			:links="tiers"
			:active="tier"
			class="border-b border-gray-200 dark:border-gray-800" />
		<NuxtPage />
	</div>
</template>
