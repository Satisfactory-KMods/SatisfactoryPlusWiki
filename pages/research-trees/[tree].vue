<script lang="ts" setup>
	import { computed, onMounted, ref } from 'vue';

	const route = useRoute();
	const tree = computed(() => {
		const { tree } = (route.params as { tree: string }) ?? {};
		if (typeof tree === 'string') {
			return tree;
		}
		return null;
	});

	if (!tree.value) {
		useRouter().push('/research-trees');
	}

	const { data } = await useFetch(`/api/research-tree/${tree.value}/tree-builder`);
	const canvasRef = ref<HTMLCanvasElement>();

	const links = [
		{
			label: 'Research Trees',
			icon: 'i-heroicons-academic-cap',
			to: '/research-trees'
		},
		{
			label: data.value?.name ?? 'Unknown',
			icon: 'i-heroicons-square-3-stack-3d'
		}
	];

	const maxY = computed(() => {
		return (
			data.value?.nodes.reduce((acc, e) => {
				return Math.max(acc, e.coordinates.Y);
			}, 0) ?? 0
		);
	});

	type Vector2D = { X: number; Y: number };
	const lines = computed(() => {
		const l: {
			coordinates: Vector2D;
			unhiddenBy: Vector2D[];
			nodesToUnhide: Vector2D[];
			parents: Vector2D[];
		}[] = [];
		if (!data.value) return l;
		for (const node of data.value.nodes) {
			const {
				coordinates,
				unhidden_by: unhiddenBy,
				nodes_to_unhide: nodesToUnhide,
				parents
			} = node;
			l.push({
				coordinates,
				unhiddenBy,
				nodesToUnhide,
				parents
			});
		}
		return l;
	});

	const width = 850;

	const lineWidth = 15;
	const gridSizeX = 110;
	const gridSizeY = 125;
	const halfGridSizeY = gridSizeY / 2;
	const cardSize = 80;
	const halfCardSize = cardSize / 2;

	const height = computed(() => {
		return gridSizeY * 1.25 + maxY.value * gridSizeY;
	});

	onMounted(() => {
		if (!canvasRef.value) {
			return;
		}

		const canvas = canvasRef.value;

		canvas.width = width;
		canvas.height = height.value;

		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.translate(0, 0);
			ctx.clearRect(0, 0, width, height.value);
			for (const { coordinates, parents } of lines.value) {
				const x = halfCardSize * 1.5 + coordinates.X * gridSizeX;
				let y =
					cardSize +
					(coordinates.Y * gridSizeY + ((coordinates.X + 1) % 2) * halfGridSizeY);
				y = y - (y / height.value) * (cardSize * 1);
				for (const { X, Y } of parents) {
					const endX = halfCardSize * 1.5 + X * gridSizeX;
					let endY = cardSize + (Y * gridSizeY + ((X + 1) % 2) * halfGridSizeY);
					endY = endY - (endY / height.value) * (cardSize * 1);
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(endX, endY);
					ctx.strokeStyle = 'rgb(55 65 81 / .75)';
					ctx.lineWidth = lineWidth;
					ctx.stroke();
				}
			}
		}
	});

	const displayNodes = computed(() => {
		const nodes = data.value?.nodes ?? [];
		return nodes.map((e) => {
			const x = halfCardSize * 1.5 + e.coordinates.X * gridSizeX;
			const y =
				cardSize +
				(e.coordinates.Y * (gridSizeY - 10) + ((e.coordinates.X + 1) % 2) * halfGridSizeY);
			return {
				...e,
				x,
				y
			};
		});
	});
</script>

<template>
	<div class="flex w-full flex-col gap-2">
		<UBreadcrumb :links="links" class="p-2" />
		<UDivider />

		<div class="flex flex-col divide-y dark:divide-gray-600">
			<div
				class="relative hidden items-center justify-center xl:flex"
				:style="`min-height:${height}`">
				<div
					class="bg-mam absolute h-full w-full rounded-lg border border-gray-700 bg-gray-900"></div>
				<div class="relative -z-0 h-full w-[850px]">
					<canvas ref="canvasRef" :width="width" :height="height" />
					<UPopover
						v-for="node in displayNodes"
						:key="node.short_path"
						:popper="{ arrow: true, placement: 'top', strategy: 'fixed' }"
						class="absolute z-0 flex h-[80px] w-[80px] -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded-lg border border-gray-600 bg-gray-700 p-2 text-neutral-200 hover:bg-gray-800 data-[headlessui-state=open]:z-50"
						:style="{
							top: `${node.y}px`,
							left: `${node.x}px`
						}"
						mode="hover">
						<template #panel>
							<div class="flex flex-col overflow-hidden p-4">
								<div class="flex items-center">
									<div class="flex-1 text-lg font-bold">{{ node.name }}</div>
									<div class="text-xs text-gray-500">{{ node.time }} Seconds</div>
								</div>
								<UDivider />
								<div class="grid min-w-[420px] flex-1 grid-cols-4 gap-2 py-2">
									<ItemsItemDisplay
										v-for="cost in node.costs"
										:key="cost.shortPath"
										:item="{
											path: cost.shortPath,
											...cost
										}"
										:amount="cost.amount" />
								</div>
							</div>
						</template>

						<NuxtLink
							:to="{
								name: 'show-id',
								params: {
									id: node.short_path
								}
							}">
							<NuxtImg
								placeholder="/sf.png"
								:src="`/sf${node.image.split('.')[0]}.png`"
								:alt="node.name"
								class="mx-auto"
								width="80"
								height="80" />
						</NuxtLink>
					</UPopover>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.bg-mam {
		background: url('/_ipx/s_64x64/img/mam_tile.png') repeat;
		opacity: 0.25;
		animation-name: MOVE-BG;
		animation-duration: 500s;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	@keyframes MOVE-BG {
		from {
			background-position: 0% 0%;
		}
		to {
			background-position: 100% 100%;
		}
	}
</style>
