<script lang="ts" setup>
	import { SFResourceNodePurity } from '#imports';
	import type { TabItem } from '@nuxt/ui/dist/runtime/types';
	import L, { CRS, LatLngBounds } from 'leaflet';
	import type { ResourceMapData } from '~/server/api/resource-map/data.get';
	import type { SecondGeneric } from '~/utils/typeUtils';

	definePageMeta({
		layout: 'expanded'
	});

	const { data: asyncData } = useFetch('/api/resource-map/data');

	watch(
		() => {
			return asyncData.value;
		},
		updateSelections,
		{ deep: true }
	);

	const readyForMarkers = ref(false);
	const map = ref();

	type SelectOption = {
		item: SecondGeneric<ResourceMapData>[0]['item'];
		locations: SecondGeneric<ResourceMapData>;
		purity: Record<
			number,
			{
				selected: boolean;
				count: number;
			}
		>;
	};

	const selectOptions = reactive({
		other: {} as Record<string, SelectOption>,
		resourceNodes: {} as Record<string, SelectOption>,
		resourceWells: {} as Record<string, SelectOption>
	});

	const config = computed(() => {
		let backgroundSize = 32768;
		const extraBackgroundSize = 4096;
		const tileSize = 256;
		const maxTileZoom = 7;
		const minTileZoom = 3;
		let mappingBoundWest = -324698.832031 * 0.79;
		let mappingBoundEast = 425301.832031 * 0.8925;
		let mappingBoundNorth = -375e3 * 0.7825;
		let mappingBoundSouth = 375e3 * 0.78;
		let westOffset = 375e3;
		let northOffset = 375e3;

		const e = (Math.abs(0) + Math.abs(mappingBoundEast)) / backgroundSize;
		const t = (Math.abs(mappingBoundNorth) + Math.abs(mappingBoundSouth)) / backgroundSize;
		westOffset = e * extraBackgroundSize;
		northOffset = t * extraBackgroundSize;
		mappingBoundWest -= westOffset;
		mappingBoundEast += westOffset;
		mappingBoundNorth -= northOffset;
		mappingBoundSouth += northOffset;
		backgroundSize += 2 * extraBackgroundSize;
		const zoomRatio = Math.ceil(Math.log(Math.max(backgroundSize, backgroundSize) / tileSize) / Math.log(2));
		return {
			backgroundSize,
			extraBackgroundSize,
			tileSize,
			maxTileZoom,
			minTileZoom,
			mappingBoundWest,
			mappingBoundEast,
			mappingBoundNorth,
			mappingBoundSouth,
			westOffset,
			northOffset,
			zoomRatio
		};
	});

	const update = () => {
		const { backgroundSize, zoomRatio, maxTileZoom, minTileZoom } = config.value;
		const e = (map.value?.leafletObject && map.value?.leafletObject.unproject([0, backgroundSize], zoomRatio)) || [0, 0];
		const t = (map.value?.leafletObject && map.value?.leafletObject.unproject([backgroundSize, 0], zoomRatio)) || [0, 0];

		return {
			bounds: new LatLngBounds(e, t),
			maxBounds: new LatLngBounds(e, t),
			center: [0, 0],
			zoom: 3,
			minZoom: minTileZoom,
			maxZoom: maxTileZoom,
			scrollWheelZoom: true,
			zoomSnap: 0.25,
			zoomDelta: 0.25,
			attributionControl: !1,
			preferCanvas: !1,
			crs: CRS.Simple
		};
	};

	const mapConfig = ref(update());

	function convertToRasterCoordinates(e: any) {
		const { mappingBoundWest, mappingBoundEast, mappingBoundNorth, mappingBoundSouth, backgroundSize, zoomRatio } = config.value;
		let t = Number(e[0] ?? 0);
		let a = Number(e[1] ?? 0);

		const s = Math.abs(mappingBoundWest) + Math.abs(mappingBoundEast);
		const r = Math.abs(mappingBoundNorth) + Math.abs(mappingBoundSouth);
		const i = Math.abs(backgroundSize) / s;
		const o = Math.abs(backgroundSize) / r;

		t = (s - mappingBoundEast + t) * i;
		a = (r - mappingBoundNorth + a) * o - backgroundSize;

		return map.value?.leafletObject?.unproject([t, a], zoomRatio);
	}

	onMounted(() => {
		const timer = setInterval(() => {
			if (!map.value?.leafletObject) return;
			mapConfig.value = update();
			readyForMarkers.value = true;
			clearInterval(timer);
			updateSelections();
		});
	});

	function updateSelections() {
		if (!asyncData.value) return;

		selectOptions.other = {};
		selectOptions.resourceNodes = {};
		selectOptions.resourceWells = {};

		for (const v of Object.values(asyncData.value)) {
			for (const row of v) {
				if (!row.item) continue;

				const path = row.item.path;

				if (SFResourceNodeType.deposits === row.type) {
					continue;
				}

				switch (row.type) {
					case SFResourceNodeType.resourceNodes:
						if (!selectOptions.resourceNodes[path]) {
							selectOptions.resourceNodes[path] = {
								item: row.item,
								locations: [],
								purity: {
									[SFResourceNodePurity.impure]: {
										selected: false,
										count: 0
									},
									[SFResourceNodePurity.normal]: {
										selected: false,
										count: 0
									},
									[SFResourceNodePurity.pure]: {
										selected: false,
										count: 0
									}
								}
							};
						}
						selectOptions.resourceNodes[path].locations.push(row as any);
						switch (convertPurity(row.purity)) {
							case SFResourceNodePurity.normal:
								selectOptions.resourceNodes[path].purity[SFResourceNodePurity.normal].count++;
								break;
							case SFResourceNodePurity.pure:
								selectOptions.resourceNodes[path].purity[SFResourceNodePurity.pure].count++;
								break;
							default:
								selectOptions.resourceNodes[path].purity[SFResourceNodePurity.impure].count++;
								break;
						}

						break;
					case SFResourceNodeType.resourceWells:
						if (!selectOptions.resourceWells[path]) {
							selectOptions.resourceWells[path] = {
								item: row.item,
								locations: [],
								purity: {
									[SFResourceNodePurity.impure]: {
										selected: false,
										count: 0
									},
									[SFResourceNodePurity.normal]: {
										selected: false,
										count: 0
									},
									[SFResourceNodePurity.pure]: {
										selected: false,
										count: 0
									}
								}
							};
						}
						selectOptions.resourceWells[path].locations.push(row as any);
						switch (convertPurity(row.purity)) {
							case SFResourceNodePurity.normal:
								selectOptions.resourceWells[path].purity[SFResourceNodePurity.normal].count++;
								break;
							case SFResourceNodePurity.pure:
								selectOptions.resourceWells[path].purity[SFResourceNodePurity.pure].count++;
								break;
							default:
								selectOptions.resourceWells[path].purity[SFResourceNodePurity.impure].count++;
								break;
						}

						break;
					default:
						if (!selectOptions.other[path]) {
							selectOptions.other[path] = {
								item: row.item,
								locations: [],
								purity: {
									[SFResourceNodePurity.impure]: {
										selected: false,
										count: 0
									},
									[SFResourceNodePurity.normal]: {
										selected: false,
										count: 0
									},
									[SFResourceNodePurity.pure]: {
										selected: false,
										count: 0
									}
								}
							};
						}
						selectOptions.other[path].locations.push(row as any);
						switch (convertPurity(row.purity)) {
							case SFResourceNodePurity.normal:
								selectOptions.other[path].purity[SFResourceNodePurity.normal].count++;
								break;
							case SFResourceNodePurity.pure:
								selectOptions.other[path].purity[SFResourceNodePurity.pure].count++;
								break;
							default:
								selectOptions.other[path].purity[SFResourceNodePurity.impure].count++;
								break;
						}

						break;
				}
			}
		}
	}

	function IsPuritySelected(purity: SFResourceNodePurity, options: SelectOption['purity']) {
		if (!options[purity]) return false;
		return options[purity].selected && options[purity].count > 0;
	}

	function isRowSelected(row: SelectOption['purity']) {
		return Object.values(row).some((v) => {
			return v.selected && v.count > 0;
		});
	}

	function convertPurityToColor(purity: SFResourceNodePurity) {
		switch (convertPurity(purity)) {
			case SFResourceNodePurity.impure:
				return 'orange';
			case SFResourceNodePurity.normal:
				return 'yellow';
			case SFResourceNodePurity.pure:
				return 'green';
			default:
				return 'gray';
		}
	}

	function convertPurity(purity: SFResourceNodePurity): SFResourceNodePurity {
		switch (purity) {
			case SFResourceNodePurity.impure:
				return SFResourceNodePurity.impure;
			case SFResourceNodePurity.pure:
				return SFResourceNodePurity.pure;
			default:
				return SFResourceNodePurity.normal;
		}
	}

	const showMarkers = computed<SelectOption['locations']>(() => {
		if (!readyForMarkers.value) return [];
		const arr: SelectOption['locations'] = [];
		for (const r of Object.values(selectOptions)) {
			for (const z of Object.values(r)) {
				if (!isRowSelected(z.purity)) continue;
				for (const location of z.locations) {
					if (!IsPuritySelected(convertPurity(location.purity), z.purity)) continue;
					arr.push(location);
				}
			}
		}
		return arr;
	});

	function keyToString(key: keyof typeof selectOptions) {
		switch (key) {
			case 'resourceNodes':
				return 'Resource Nodes';
			case 'resourceWells':
				return 'Resource Wells';
			default:
				return 'Other';
		}
	}

	const items = ref<TabItem[]>([
		{
			key: 'resourceNodes' as keyof typeof selectOptions,
			label: keyToString('resourceNodes')
		},
		{
			key: 'resourceWells' as keyof typeof selectOptions,
			label: keyToString('resourceWells')
		},
		{
			key: 'other' as keyof typeof selectOptions,
			label: keyToString('other')
		}
	]);

	function toggleAllInCategory(key: keyof typeof selectOptions, to: boolean, purity: SFResourceNodePurity) {
		for (const k of Object.keys(selectOptions[key])) {
			// @ts-ignore
			selectOptions[key][k].purity[purity].selected = to;
		}
	}

	function createMapMarkerIcon(item: SecondGeneric<ResourceMapData>[0]['item'], purity: SFResourceNodePurity, rounded = false) {
		// eslint-disable-next-line import/no-named-as-default-member
		return new L.Icon({
			iconUrl: `/_ipx/s_50x50/sf${item!.image.split('.')[0]}.png`,
			className: `bg-${convertPurityToColor(purity)}-500 ${rounded ? 'rounded-full' : 'rounded'} shadow-md border border-gray-200 p-1`,
			iconSize: [32, 32],
			iconAnchor: [16, 32]
		});
	}

	const tabUi /*ui*/ = {
		base: 'focus:outline-none h-full',
		wrapper: 'relative h-full flex flex-col overflow-hidden',
		container: 'relative w-full h-full flex flex-col overflow-hidden p-1'
	};
</script>

<template>
	<div class="flex h-full gap-4 overflow-hidden">
		<div class="h-full w-full flex-[0.75]">
			<LMap
				ref="map"
				:zoom="mapConfig.zoom"
				:center="[0, 0]"
				:min-zoom="config.minTileZoom"
				:max-zoom="config.maxTileZoom"
				:bounds="mapConfig.bounds"
				:max-bounds="mapConfig.maxBounds">
				<LTileLayer url="https://kyrium.space/static/new-map/prod/{z}/{x}/{y}.png"></LTileLayer>

				<template v-for="marker of showMarkers" :key="marker.id">
					<LMarker
						:icon="createMapMarkerIcon(marker.item, convertPurity(marker.purity))"
						:lat-lng="convertToRasterCoordinates([marker.x, marker.y])"
						@click="
							$router.push({
								name: 'show-id',
								params: {
									id: String(blueprintPathToShort(marker.item!.path))
								}
							})
						" />
					<LMarker
						v-for="(sat, idx) of marker.satelites"
						:key="`${marker.id}${idx}`"
						:icon="createMapMarkerIcon(marker.item, convertPurity(sat.purity), true)"
						:lat-lng="convertToRasterCoordinates([sat.x, sat.y])"
						@click="
							$router.push({
								name: 'show-id',
								params: {
									id: String(blueprintPathToShort(marker.item!.path))
								}
							})
						" />
				</template>
			</LMap>
		</div>

		<div class="flex h-full flex-[0.25] flex-col items-center justify-items-center gap-2 overflow-hidden px-1">
			<UTabs :ui="tabUi" :items="items" class="w-full">
				<template #item="{ item }">
					<UCard
						:ui="{
							base: 'flex flex-col h-full overflow-hidden',
							body: {
								padding: 'p-0 sm:p-0 overflow-auto flex flex-col gap-2 h-full max-h-full relative'
							}
						}">
						<template #header>
							<div class="mb-2 flex gap-2">
								<UButton
									class="flex-1"
									color="orange"
									@click="toggleAllInCategory(item.key as keyof typeof selectOptions, true, SFResourceNodePurity.impure)"
									>Select all Impure</UButton
								>
								<UButton
									class="flex-1"
									color="yellow"
									@click="toggleAllInCategory(item.key as keyof typeof selectOptions, true, SFResourceNodePurity.normal)"
									>Select all Normal</UButton
								>
								<UButton
									class="flex-1"
									color="green"
									@click="toggleAllInCategory(item.key as keyof typeof selectOptions, true, SFResourceNodePurity.pure)"
									>Select all Pure</UButton
								>
							</div>

							<div class="flex gap-2">
								<UButton
									class="flex-1"
									color="red"
									@click="toggleAllInCategory(item.key as keyof typeof selectOptions, false, SFResourceNodePurity.impure)"
									>Clear all Impure</UButton
								>
								<UButton
									class="flex-1"
									color="red"
									@click="toggleAllInCategory(item.key as keyof typeof selectOptions, false, SFResourceNodePurity.normal)"
									>Clear all Normal</UButton
								>
								<UButton
									class="flex-1"
									color="red"
									@click="toggleAllInCategory(item.key as keyof typeof selectOptions, false, SFResourceNodePurity.pure)"
									>Clear all Pure</UButton
								>
							</div>
						</template>

						<div class="relative overflow-auto p-2">
							<template v-for="[k, resource] of Object.entries(selectOptions[item.key as keyof typeof selectOptions])" :key="k">
								<div
									v-if="resource.item"
									class="relative flex h-fit w-full flex-col justify-items-center gap-2 overflow-hidden rounded border bg-gray-100 p-1 dark:border-gray-950 dark:bg-gray-800">
									<NuxtLink
										:to="{
											name: 'show-id',
											params: {
												id: String(blueprintPathToShort(resource.item.path))
											}
										}">
										<Icon name="i-heroicons-link" class="absolute right-2 top-2 h-4 w-4" />
									</NuxtLink>
									<div class="flex gap-2">
										<NuxtImg
											:src="`/sf${resource.item.image.split('.')[0]}.png`"
											:alt="resource.item.name"
											width="50"
											height="50"
											class="rounded border border-gray-700 bg-gray-900 p-1" />
										<div class="flex flex-1 flex-col">
											<span class="font-semibold">{{ resource.item.name }}</span>
											<span class="flex items-center text-xs text-gray-600 dark:text-gray-400">
												{{ item.label }}
											</span>
										</div>
									</div>
									<div class="flex gap-2">
										<UButton
											v-if="!!resource.purity[SFResourceNodePurity.impure].count"
											class="flex-1"
											color="orange"
											:variant="IsPuritySelected(SFResourceNodePurity.impure, resource.purity) ? 'solid' : 'outline'"
											@click="
												selectOptions[item.key as keyof typeof selectOptions][k].purity[
													SFResourceNodePurity.impure
												].selected =
													!selectOptions[item.key as keyof typeof selectOptions][k].purity[SFResourceNodePurity.impure]
														.selected
											"
											>Impure ({{ resource.purity[SFResourceNodePurity.impure].count }})</UButton
										>
										<UButton
											v-if="!!resource.purity[SFResourceNodePurity.normal].count"
											class="flex-1"
											color="yellow"
											:variant="IsPuritySelected(SFResourceNodePurity.normal, resource.purity) ? 'solid' : 'outline'"
											@click="
												selectOptions[item.key as keyof typeof selectOptions][k].purity[
													SFResourceNodePurity.normal
												].selected =
													!selectOptions[item.key as keyof typeof selectOptions][k].purity[SFResourceNodePurity.normal]
														.selected
											"
											>Normal ({{ resource.purity[SFResourceNodePurity.normal].count }})</UButton
										>
										<UButton
											v-if="!!resource.purity[SFResourceNodePurity.pure].count"
											class="flex-1"
											color="green"
											:variant="IsPuritySelected(SFResourceNodePurity.pure, resource.purity) ? 'solid' : 'outline'"
											@click="
												selectOptions[item.key as keyof typeof selectOptions][k].purity[SFResourceNodePurity.pure].selected =
													!selectOptions[item.key as keyof typeof selectOptions][k].purity[SFResourceNodePurity.pure]
														.selected
											"
											>Pure ({{ resource.purity[SFResourceNodePurity.pure].count }})</UButton
										>
									</div>
								</div>
							</template>
						</div>
					</UCard>
				</template>
			</UTabs>
		</div>
	</div>
</template>
