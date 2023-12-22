<script setup lang="ts">
	import { useLastVisit } from '~/stores/useLastVisit';

	const { signIn, signOut, session } = useAuth();
	const visitStore = useLastVisit();

	const general = [
		{
			label: 'Home',
			icon: 'i-heroicons-home',
			to: '/',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Search',
			icon: 'i-heroicons-magnifying-glass',
			to: '/search',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Milestones',
			icon: 'i-mdi-progress-upload',
			to: '/milestones/tier-1',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Awsome Shop',
			icon: 'i-mdi-shopping-outline',
			to: '/awsome-shop',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Research Trees',
			icon: 'i-heroicons-academic-cap',
			to: '/research-trees',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Resource Map',
			icon: 'i-heroicons-map',
			to: '/map',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Items',
			icon: 'i-heroicons-archive-box',
			to: '/items',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Recipes',
			icon: 'i-heroicons-book-open',
			to: '/recipes',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Alternate Recipes',
			icon: 'i-heroicons-book-open',
			to: '/recipes/alternate',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Buildings',
			icon: 'i-mdi-factory',
			to: '/buildings',
			exact: false,
			exactMatch: false
		}
	];

	const about = [
		{
			label: 'About',
			icon: 'i-heroicons-information-circle',
			to: '/about',
			exact: false,
			exactMatch: false
		},
		{
			label: 'Changelog',
			icon: 'i-heroicons-document-text',
			to: 'https://github.com/Satisfactory-KMods/SatisfactoryPlusWiki/releases',
			exact: false,
			exactMatch: false,
			target: '_blank'
		},
		{
			label: 'Satisfactory Plus',
			icon: 'i-mdi-factory',
			to: 'https://ficsit.app/mod/SatisfactoryPlus',
			exact: false,
			exactMatch: false,
			target: '_blank'
		}
	];

	const more = [
		{
			label: 'Contribute',
			icon: 'i-mdi-github-face',
			to: 'https://github.com/Satisfactory-KMods/SatisfactoryPlusWiki',
			exact: false,
			exactMatch: false,
			target: '_blank'
		},
		{
			label: 'Our Mods',
			icon: 'i-mdi-factory',
			to: 'https://ficsit.app/user/9uvZtCA4cM6H4q',
			exact: false,
			exactMatch: false,
			target: '_blank'
		},
		{
			label: 'Discord',
			icon: 'i-mdi-discord',
			to: 'https://discord.gg/7mePXyfsJd',
			exact: false,
			exactMatch: false,
			target: '_blank'
		},
		{
			label: 'Patreon',
			icon: 'i-mdi-patreon',
			to: 'https://www.patreon.com/kmods',
			exact: false,
			exactMatch: false,
			target: '_blank'
		}
	];

	const lastVisit = computed(() => {
		return visitStore.data.map((visit) => {
			return {
				label: visit.name,
				icon: 'i-heroicons-clock',
				to: visit.path,
				exact: false,
				exactMatch: false
			};
		});
	});

	const ui /*ui*/ = {
		wrapper: 'border-s border-gray-200 dark:border-gray-800 space-y-2',
		base: 'group border-s -ms-px lg:leading-6 before:hidden items-center flex hover:dark:bg-opacity-25 hover:bg-opacity-[0.02] hover:bg-black',
		padding: 'p-1 ps-4',
		rounded: '',
		font: '',
		ring: '',
		icon: {
			base: 'w-5 h-5',
			active: 'text-primary-500 dark:text-primary-400'
		},
		active: 'text-primary-500 dark:text-primary-400 border-current font-semibold dark:bg-opacity-25 bg-opacity-[0.02] bg-black',
		inactive:
			'border-transparent hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
	};
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-3 p-3">
			<UAvatar :alt="String(session?.user)" :src="session?.user?.image ?? undefined" size="sm" />

			<template v-if="session?.user?.name">
				<span div class="block flex-1 px-2 font-semibold">{{ capitalizeFirstLetter(session.user.name) }}</span>
				<UButton variant="ghost" size="sm" icon="i-heroicons-arrow-left-start-on-rectangle-20-solid" @click="signOut" />
			</template>

			<template v-else>
				<span div class="block flex-1 px-2 font-semibold">Welcome Guest</span>
				<UButton variant="ghost" size="sm" icon="i-heroicons-arrow-left-end-on-rectangle-20-solid" @click="signIn('discord')" />
			</template>
		</div>

		<div class="font-semibold">Overview</div>
		<UVerticalNavigation :links="general" :ui="ui" />

		<div class="mt-3 font-semibold">About</div>
		<UVerticalNavigation :links="about" :ui="ui" />

		<div class="mt-3 font-semibold">More</div>
		<UVerticalNavigation :links="more" :ui="ui" />

		<template v-if="lastVisit.length">
			<div class="font-semibold">Last Visits</div>
			<UVerticalNavigation :links="lastVisit" :ui="ui" />
		</template>
	</div>
</template>
