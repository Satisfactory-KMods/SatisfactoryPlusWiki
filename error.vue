<script setup lang="ts">
	import type { NuxtError } from '@nuxt/types';
	useDarkMode();

	const props = defineProps({
		error: {
			type: Error as PropType<NuxtError>,
			default: null
		}
	});

	useHead({
		title: `SFP-Wiki | Error ${props.error.statusCode}`,
		htmlAttrs: {
			class: 'nuxt-ui-scrollbars'
		}
	});

	const $router = useRouter();
	if (!props.error) $router.push('/');
</script>

<template>
	<div v-if="$props.error" class="flex h-screen w-screen items-center justify-items-center dark:bg-gray-900">
		<div class="mx-auto text-center">
			<div class="flex items-center gap-10 rounded-xl px-10 py-3">
				<div style="font-size: 175px">{{ $props.error.statusCode }}</div>
				<div class="flex-1">
					<p class="py-3 text-3xl"><span class="text-red-600">Opps!</span> Something went wrong!</p>
					<p class="pb-2 text-xl">
						{{ $props.error.message }}
					</p>
					<div class="flex items-center justify-center gap-3 py-3">
						<UButton @click="$router.back()">Back</UButton>
						<UButton @click="$router.push('/')">To Dashboard</UButton>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
