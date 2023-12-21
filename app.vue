<script setup lang="ts">
	import { ModalsContainer } from 'vue-final-modal';
	useDarkMode();

	useHead({
		title: 'SFP-Wiki',
		htmlAttrs: {
			class: `nuxt-ui-scrollbars`
		}
	});
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
