<script setup lang="ts">
	import { ModalsContainer } from 'vue-final-modal';

	useHead({
		title: 'SFP-Wiki',
		htmlAttrs: {
			class: 'nuxt-ui-scrollbars'
		}
	});

	useDarkMode();
</script>

<template>
	<div>
		<NuxtLoadingIndicator />

		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>

		<UNotifications />
		<ModalsContainer />
	</div>
</template>
