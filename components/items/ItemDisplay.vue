<script lang="ts" setup>
	const slots = useSlots();
	const props = defineProps({
		item: {
			type: Object as PropType<ItemDisplay>,
			required: true
		},
		amount: {
			type: Number,
			default: () => {
				return undefined;
			},
			required: false
		},
		perMinute: {
			type: Number,
			default: () => {
				return undefined;
			},
			required: false
		},
		imageSize: {
			type: [Number, String],
			default: 64,
			required: false
		}
	});

	const showItemsPerMinute = computed(() => {
		return (!!props.perMinute && props.perMinute > 0) || !!slots['per-minute'];
	});

	const showAmount = computed(() => {
		return (!!props.amount && props.amount > 0) || !!slots.amount;
	});

	const isSolid = computed(() => {
		return props.item.form === SFItemForm.SOLID;
	});
</script>

<template>
	<NuxtLink
		:to="{
			name: 'show-id',
			params: {
				id: String(blueprintPathToShort($props.item.path))
			}
		}"
		class="flex min-w-[100px] max-w-[100px] flex-col items-center rounded border bg-gray-100 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 hover:dark:bg-gray-950"
		@click.stop>
		<UTooltip
			:text="$props.item.name"
			class="w-full border-b bg-slate-200 bg-opacity-50 px-2 py-1 text-center dark:border-gray-700 dark:bg-slate-900">
			<div class="flex-1 truncate">{{ $props.item.name }}</div>
		</UTooltip>
		<div class="relative">
			<div
				v-if="showAmount"
				class="absolute right-1 top-1 rounded-full bg-orange-500 p-[0.125rem] px-2 text-xs font-semibold text-white dark:bg-orange-700">
				<slot name="amount">
					{{
						$props.item.form === SFItemForm.SOLID
							? $props.amount
							: $props.amount! / 1000
					}}{{ !isSolid ? 'm³' : '' }}
				</slot>
			</div>

			<!-- lable on bottom centered -->
			<div
				v-if="showItemsPerMinute"
				class="absolute bottom-1 left-1/2 -translate-x-1/2 transform text-nowrap rounded bg-gray-800 bg-opacity-75 px-2 py-1 text-xs font-semibold text-white dark:bg-gray-700">
				<slot name="per-minute">
					{{ $props.perMinute }}{{ !isSolid ? 'm³' : '' }} / min
				</slot>
			</div>
			<NuxtImg
				placeholder="/sf.png"
				:src="`/sf${$props.item.image.split('.')[0]}.png`"
				:alt="$props.item.name"
				:width="$props.imageSize"
				:height="$props.imageSize"
				class="m-2" />
		</div>
		<div
			v-if="$slots.extra"
			class="w-full border-t bg-slate-200 bg-opacity-50 px-2 py-1 text-center dark:border-gray-700 dark:bg-slate-900">
			<div class="flex-1 truncate"><slot name="extra" /></div>
		</div>
	</NuxtLink>
</template>
