<script setup lang="ts">
	const { toggle, modeIcon } = useDarkMode();
</script>

<template>
	<div class="flex h-screen w-screen flex-col overflow-hidden dark:bg-gray-900">
		<div class="border py-2 dark:border-gray-800">
			<UContainer>
				<div class="flex items-center gap-3 p-1">
					<NuxtLink to="/" class="flex flex-1 items-center gap-2">
						<NuxtImg src="/img/logo.webp" width="40" height="40" class="rounded" />
						<div class="flex flex-col">
							<span class="font-bold">Satisfactory Plus</span>
							<span class="text-xs text-gray-600 dark:text-gray-400">Wiki</span>
						</div>
					</NuxtLink>

					<div class="flex gap-2">
						<LayoutSmartSearchbar />
						<UButton :key="modeIcon" size="lg" class="float-right" variant="ghost" :icon="modeIcon" @click="toggle" />
					</div>
				</div>
			</UContainer>
		</div>
		<div class="flex-1 overflow-hidden">
			<UContainer class="h-full">
				<div class="grid h-full grid-cols-12 overflow-hidden">
					<div class="col-span-3 overflow-y-auto border-e dark:border-gray-800">
						<LayoutSidebar />
					</div>
					<div class="col-span-9 overflow-y-auto p-2">
						<slot />
					</div>
				</div>
			</UContainer>
		</div>
		<Footer />
	</div>
</template>
