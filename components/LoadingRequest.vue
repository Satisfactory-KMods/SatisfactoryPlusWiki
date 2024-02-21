<script lang="ts" setup>
	import type { PropType } from 'vue';

	defineProps({
		status: {
			type: String as PropType<'idle' | 'pending' | 'success' | 'error'>,
			required: true
		},
		error: {
			type: null as unknown as PropType<Error | undefined | null>,
			required: true
		},
		refresh: {
			type: Function as PropType<() => void>,
			required: true
		}
	});
</script>
<template>
	<div class="flex flex-col items-center py-10">
		<div v-if="$props.status === 'pending'" class="flex gap-2">
			<Icon name="svg-spinners:ring-resize" size="48" class="text-primary" />
			<div class="flex flex-col">
				<span class="text-primary text-lg">Loading...</span>
				<span class="text-xs">Please wait a moment.</span>
			</div>
		</div>

		<div v-else-if="$props.status === 'error' && $props.error" class="flex gap-2">
			<Icon name="heroicons:exclamation-triangle-20-solid" size="48" class="text-red-700" />
			<div class="flex flex-col">
				<span class="text-lg text-red-700">Error!</span>
				<span class="text-xs">{{ error }}</span>
			</div>
		</div>
	</div>
</template>
