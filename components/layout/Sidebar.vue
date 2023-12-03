<script setup lang="ts">
	import { useLastVisit } from '~/stores/useLastVisit';

	const { signIn, signOut, session, status, cookies, getProviders } = useAuth();
	const visitStore = useLastVisit();

	const general = [
		{
			label: 'Dashboard',
			icon: 'i-heroicons-home',
			to: '/',
			exact: false,
			exactMatch: false
		},
		{
			label: 'User Management',
			icon: 'i-heroicons-users',
			to: '/user/management',
			exact: false,
			exactMatch: false
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
				<UButton variant="ghost" size="sm" icon="i-heroicons-arrow-right-on-rectangle" @click="signOut" />
			</template>

			<template v-else>
				<span div class="block flex-1 px-2 font-semibold">Welcome Guest</span>
				<UButton variant="ghost" size="sm" icon="i-heroicons-arrow-left-on-rectangle" @click="signIn('discord')" />
			</template>
		</div>

		<div class="font-semibold">Overview</div>
		<UVerticalNavigation :links="general" :ui="ui" />

		<template v-if="lastVisit.length">
			<div class="font-semibold">Last Visits</div>
			<UVerticalNavigation :links="lastVisit" :ui="ui" />
		</template>
	</div>
</template>
