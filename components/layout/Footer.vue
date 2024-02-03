<script lang="ts" setup>
	import pkg from '~/package.json';
</script>

<template>
	<div class="border py-2 dark:border-gray-800">
		<UContainer>
			<div class="flex items-center gap-3 p-1">
				<NuxtLink to="/" class="flex flex-1 items-center gap-2">
					<NuxtImg src="/img/avatar.webp" width="40" height="40" class="rounded" />
					<div class="flex flex-col">
						<span class="font-bold">KMods</span>
						<span class="text-xs text-gray-600 dark:text-gray-400"
							>The assets comes from Satisfactory or from websites created and owned by Coffee Stain Studios, who hold the copyright of
							Satisfactory. All trademarks and registered trademarks present in the image are proprietary to Coffee Stain Studios.</span
						>
					</div>
				</NuxtLink>
				<div class="flex-1">
					<div class="flex justify-end gap-3">
						<UButton icon="i-mdi-github" target="_blank" variant="ghost" to="/contact"> </UButton>
						<UButton icon="i-mdi-patreon" target="_blank" variant="ghost"></UButton>
						<UButton
							icon="i-mdi-book"
							target="_blank"
							to="https://github.com/Satisfactory-KMods/SatisfactoryPlusWiki/releases"
							variant="ghost">
							{{ pkg.version }}
						</UButton>
					</div>
				</div>
			</div>
			<hr class="my-2 border-slate-700" />
			<div class="flex items-center gap-3 p-1">
				<div class="flex-1">
					<div class="flex justify-start gap-3">
						<div class="text-sm">© 2023Oliver Kaufmann | KMods</div>
					</div>
				</div>
				<div class="flex-1">
					<div class="flex justify-end gap-3">
						<div class="text-sm">Satisfactory Plus Data: v.{{ pkg['game-version'] }}</div>
					</div>
				</div>
			</div>
		</UContainer>
	</div>
</template>
