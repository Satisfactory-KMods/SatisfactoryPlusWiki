<script lang="ts" setup>
	defineProps({
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		image: {
			type: String,
			required: true
		},
		useSpoiler: {
			type: Boolean,
			required: true
		},
		mapLink: {
			type: String,
			required: false,
			default: () => {
				return undefined;
			}
		}
	});
	const spoilerMode = useSpoilerMode();
</script>

<template>
	<div
		class="relative flex items-center gap-2 rounded border bg-gray-100 p-2 dark:border-slate-700 dark:bg-slate-800">
		<NuxtImg
			:src="`/sf${$props.image.split('.')[0]}.png`"
			:alt="$props.title"
			class="h-24 w-24 self-start rounded border border-slate-800 bg-slate-900 p-2"
			width="128"
			placeholder="/sf.png"
			height="128" />

		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-bold">{{ $props.title }}</h1>
			<p class="whitespace-break-spaces text-sm opacity-75" v-html="$props.description" />
		</div>

		<div class="absolute right-2 top-2 flex gap-2">
			<UButton
				v-if="$props.mapLink"
				variant="ghost"
				:to="$props.mapLink"
				icon="i-entypo-map"
				@click="spoilerMode.toggle">
				Show on Map
			</UButton>

			<UButton
				v-if="$props.useSpoiler"
				variant="ghost"
				:icon="spoilerMode.active ? 'i-entypo-eye' : 'i-entypo-eye-with-line'"
				@click="spoilerMode.toggle">
				{{ spoilerMode.active ? 'Show Spoiler' : 'Hide Spoiler' }}
			</UButton>
		</div>
	</div>
</template>
