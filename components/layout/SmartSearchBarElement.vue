<script setup lang="ts">
	import type { ApiSearchResponse } from '~/server/api/search.get';

	defineProps({
		data: {
			type: Object as PropType<ApiSearchResponse['building'][0]>,
			required: true
		}
	});
</script>

<template>
	<NuxtLink
		:to="{
			name: 'show-id',
			params: {
				id: String(blueprintPathToShort(data.path))
			}
		}"
		class="flex w-full items-center gap-2 rounded border bg-gray-100 p-1 hover:bg-gray-200 dark:border-gray-500 dark:bg-gray-600 hover:dark:bg-gray-700">
		<NuxtImg
			:src="`/sf${data.image.split('.')[0]}.png`"
			:alt="data.name"
			width="50"
			height="50"
			class="rounded border border-gray-500 bg-gray-700 p-1" />
		<span class="flex-1 font-semibold">{{ data.name }}</span>
	</NuxtLink>
</template>
