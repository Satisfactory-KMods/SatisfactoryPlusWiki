<script setup lang="ts">
	const darkmode = useDarkMode();
</script>

<template>
	<div class="flex h-screen w-screen flex-col overflow-hidden dark:bg-gray-900">
		<div class="border py-2 dark:border-gray-800">
			<UContainer>
				<div class="flex items-center gap-3 p-1">
					<LazyNuxtImg src="/img/logo.webp" width="40" height="40" class="rounded" />
					<div class="flex-1 text-xl font-bold">Satisfactory Plus <span class="text-blue-500">Wiki</span></div>
					<div class="flex gap-2">
						<LayoutSmartSearchbar />
						<UButton
							size="lg"
							class="float-right"
							variant="ghost"
							:icon="darkmode ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
							@click="darkmode = !darkmode" />
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
	</div>
</template>
