<script lang="ts" setup>
	import pkg from '~/package.json';
</script>

<template>
	<div class="border py-2 dark:border-gray-800">
		<UContainer>
			<div class="flex items-center gap-3 p-1">
				<div class="flex flex-1 items-center gap-4">
					<NuxtImg src="/img/avatar.webp" width="64" height="64" class="rounded" placeholder="/sf.png" />
					<div class="flex flex-col">
						<span class="font-bold">KMods</span>
						<span class="text-xs text-gray-600 dark:text-gray-400"
							>The assets comes from Satisfactory or from websites created and owned by Coffee Stain Studios, who hold the copyright of
							Satisfactory. All trademarks and registered trademarks present in the image are proprietary to Coffee Stain Studios.</span
						>
					</div>
				</div>
				<div class="flex-1">
					<div class="flex justify-end gap-3">
						<UButton icon="i-mdi-github" target="_blank" variant="link" to="https://github.com/Satisfactory-KMods/SatisfactoryPlusWiki">
						</UButton>
						<UButton icon="i-mdi-patreon" target="_blank" variant="link" to="https://www.patreon.com/kmods"></UButton>
						<UButton icon="i-mdi-discord" target="_blank" variant="link" to="https://discord.gg/7mePXyfsJd"></UButton>
						<UButton icon="i-mdi-factory" target="_blank" variant="link" to="https://ficsit.app/user/9uvZtCA4cM6H4q"></UButton>
						<UButton
							icon="i-mdi-book"
							target="_blank"
							to="https://github.com/Satisfactory-KMods/SatisfactoryPlusWiki/releases"
							variant="link">
							{{ pkg.version }}
						</UButton>
					</div>
				</div>
			</div>
			<hr class="my-2 border-slate-700" />
			<div class="flex items-center gap-3 p-1">
				<div class="flex-1">
					<div class="flex justify-start gap-3">
						<div class="text-sm">© 2023 - Oliver Kaufmann | KMods</div>
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
