<script lang="ts" setup>
	import type { CummonDisplayBox } from '~/utils/items';

	const props = defineProps({
		item: {
			type: Object as PropType<CummonDisplayBox>,
			required: true
		},
		imageSize: {
			type: [Number, String],
			default: 64,
			required: false
		}
	});
</script>

<template>
	<component
		:is="!props.item.to ? 'div' : defineNuxtLink({})"
		:to="props.item.to"
		class="flex min-w-[100px] max-w-[100px] flex-col items-center rounded border bg-gray-100 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 hover:dark:bg-gray-950"
		@click.stop>
		<UTooltip
			:text="$props.item.label"
			class="w-full border-b bg-slate-200 bg-opacity-50 px-2 py-1 text-center dark:border-gray-700 dark:bg-slate-900">
			<div class="flex-1 truncate">{{ $props.item.label }}</div>
		</UTooltip>
		<div class="relative">
			<NuxtImg
				placeholder="/sf.png"
				:src="`/sf${$props.item.image?.split('.')[0] ?? ''}.png`"
				:alt="$props.item.label"
				:width="$props.imageSize"
				:height="$props.imageSize"
				class="m-2 rounded" />
		</div>
	</component>
</template>
