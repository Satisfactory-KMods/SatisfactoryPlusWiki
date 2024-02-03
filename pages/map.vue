<script lang="ts" setup>
	import { SFResourceNodePurity, SFResourceNodeType } from '#imports';
	import L, { CRS, LatLngBounds } from 'leaflet';
	import cloneDeep from 'lodash/cloneDeep';
	import type { ResourceMapData } from '~/server/api/resource-map/data.get';
	import { log } from '~/utils/logger';
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

	const route = useRoute();
	const router = useRouter();
	onMounted(() => {
		const timer = setInterval(() => {
			if (!map.value?.leafletObject) return;
			mapConfig.value = update();
			readyForMarkers.value = true;
			clearInterval(timer);
			updateSelections();
		});
	});

	const selectedPurs = computed<[string, SFResourceNodePurity[], SFResourceNodeType][]>({
		get() {
			const { sel } = route.query ?? {};

			if (sel) {
				try {
					return Array.from(JSON.parse(decodeURIComponent(String(sel))));
				} catch (e) {
					log('error', e);
				}
			}

			return [];
		},
		set(value) {
			router.replace({ query: { ...route.query, sel: encodeURIComponent(JSON.stringify(value)) } });
		}
	});

	function updateSelections() {
		if (!asyncData.value) return;

		selectOptions.other = {};
		selectOptions.resourceNodes = {};
		selectOptions.resourceWells = {};

		for (const v of Object.values(asyncData.value)) {
			for (const row of v) {
				const path = row.item?.path ?? row.type;

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

	function IsPuritySelected(key: string, type: SFResourceNodeType, purity: SFResourceNodePurity) {
		return selectedPurs.value.some(([k, p, t]) => {
			return k === key && p.includes(purity) && type === t;
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

	const items: {
		content: string;
		label: string;
	}[] = [
		{
			content: 'resourceNodes' as keyof typeof selectOptions,
			label: keyToString('resourceNodes')
		},
		{
			content: 'resourceWells' as keyof typeof selectOptions,
			label: keyToString('resourceWells')
		},
		{
			content: 'other' as keyof typeof selectOptions,
			label: keyToString('other')
		}
	];

	const showMarkers = computed<SelectOption['locations']>(() => {
		if (!readyForMarkers.value) return [];
		const arr: SelectOption['locations'] = [];
		for (const [key, r] of Object.entries(selectOptions)) {
			for (const z of Object.values(r)) {
				for (const location of z.locations) {
					if (!IsPuritySelected(z.item?.path ?? 'lootChests', key as SFResourceNodeType, convertPurity(location.purity))) continue;
					arr.push(location);
				}
			}
		}
		return arr;
	});

	function toggleAllInCategory(key: keyof typeof selectOptions, force: boolean, purity: SFResourceNodePurity) {
		const copy = {
			value: cloneDeep(selectedPurs.value)
		};
		for (const type of Object.keys(selectOptions[key])) {
			const idx = copy.value.findIndex(([k, , t]) => {
				return t === key && type === k;
			});
			const item = copy.value[idx];
			if (item) {
				if (item[1].includes(purity)) {
					if (force && typeof force !== 'undefined') continue;
					item[1] = item[1].filter((p) => {
						return p !== purity;
					});
				} else {
					if (!force && typeof force !== 'undefined') continue;
					item[1].push(purity);
				}

				if (item[1].length === 0) {
					copy.value = copy.value.filter(([k, , t]) => {
						return !(t === key && type === k);
					});
				}
			} else {
				if (!force && typeof force !== 'undefined') continue;
				copy.value = [...copy.value, [type, [purity], key as SFResourceNodeType]];
			}
		}

		selectedPurs.value = copy.value;
	}

	function createMapMarkerIcon(
		item: SecondGeneric<ResourceMapData>[0]['item'],
		type: SFResourceNodeType,
		purity: SFResourceNodePurity,
		rounded = false
	) {
		// eslint-disable-next-line import/no-named-as-default-member
		return new L.Icon({
			iconUrl: item ? `/_ipx/s_50x50/sf${item.image.split('.')[0]}.png` : `/map/${type}.png`,
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

	const selected = computed({
		get() {
			const index = items.findIndex((item) => {
				return item.label === route.query.tab;
			});
			if (index === -1) {
				return 0;
			}

			return index;
		},
		set(value) {
			router.replace({ query: { ...route.query, tab: items[value].label } });
		}
	});

	function selectResourceAndPurity(key: string = 'lootChests', type: SFResourceNodeType, purity: SFResourceNodePurity, force?: boolean) {
		const idx = selectedPurs.value.findIndex(([k, , t]) => {
			return k === key && type === t;
		});
		const item = cloneDeep(selectedPurs.value[idx]);
		if (item) {
			if (item[1].includes(purity)) {
				if (force && typeof force !== 'undefined') return;
				item[1] = item[1].filter((p) => {
					return p !== purity;
				});
			} else {
				if (!force && typeof force !== 'undefined') return;
				item[1].push(purity);
			}

			if (item[1].length === 0) {
				selectedPurs.value = selectedPurs.value.filter(([k, , t]) => {
					return !(k === key && type === t);
				});
			} else {
				const copy = cloneDeep(selectedPurs.value);
				copy[idx] = item;
				selectedPurs.value = copy;
			}
		} else {
			if (!force && typeof force !== 'undefined') return;
			selectedPurs.value = [...selectedPurs.value, [key, [purity], type]];
		}
	}
</script>

<template>
	<div class="flex h-full gap-1 overflow-hidden">
		<div class="h-full w-full flex-[0.75]">
			<ClientOnly>
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
							:icon="createMapMarkerIcon(marker.item, marker.type, convertPurity(marker.purity))"
							:lat-lng="convertToRasterCoordinates([marker.x, marker.y])"
							@click="
								$router.push({
									name: 'show-id',
									params: {
										id: String(marker.item ? blueprintPathToShort(marker.item.path) : `/map/${marker.type}.png`)
									}
								})
							" />
						<LMarker
							v-for="(sat, idx) of marker.satelites"
							:key="`${marker.id}${idx}`"
							:icon="createMapMarkerIcon(marker.item, marker.type, convertPurity(sat.purity), true)"
							:lat-lng="convertToRasterCoordinates([sat.x, sat.y])"
							@click="
								$router.push({
									name: 'show-id',
									params: {
										id: String(marker.item ? blueprintPathToShort(marker.item.path) : `/map/${marker.type}.png`)
									}
								})
							" />
					</template>
				</LMap>
			</ClientOnly>
		</div>

		<div class="flex h-full flex-[0.25] flex-col items-center justify-items-center gap-2 overflow-hidden px-1">
			<UTabs v-model="selected" :ui="tabUi" :items="items" class="w-full">
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
									@click="toggleAllInCategory(item.content as keyof typeof selectOptions, true, SFResourceNodePurity.impure)"
									>Select all Impure</UButton
								>
								<UButton
									class="flex-1"
									color="yellow"
									@click="toggleAllInCategory(item.content as keyof typeof selectOptions, true, SFResourceNodePurity.normal)"
									>Select all Normal</UButton
								>
								<UButton
									class="flex-1"
									color="green"
									@click="toggleAllInCategory(item.content as keyof typeof selectOptions, true, SFResourceNodePurity.pure)"
									>Select all Pure</UButton
								>
							</div>

							<div class="flex gap-2">
								<UButton
									class="flex-1"
									color="red"
									@click="toggleAllInCategory(item.content as keyof typeof selectOptions, false, SFResourceNodePurity.impure)"
									>Clear all Impure</UButton
								>
								<UButton
									class="flex-1"
									color="red"
									@click="toggleAllInCategory(item.content as keyof typeof selectOptions, false, SFResourceNodePurity.normal)"
									>Clear all Normal</UButton
								>
								<UButton
									class="flex-1"
									color="red"
									@click="toggleAllInCategory(item.content as keyof typeof selectOptions, false, SFResourceNodePurity.pure)"
									>Clear all Pure</UButton
								>
							</div>
						</template>

						<div class="relative overflow-auto p-2">
							<template v-for="[k, resource] of Object.entries(selectOptions[item.content as keyof typeof selectOptions])" :key="k">
								<div
									v-if="resource.item"
									class="relative flex h-fit w-full flex-col justify-items-center overflow-hidden rounded border bg-gray-100 p-1 dark:border-gray-950 dark:bg-gray-800">
									<UButton
										square
										variant="link"
										size="2xs"
										class="absolute right-2 top-2"
										icon="i-heroicons-link"
										:to="{
											name: 'show-id',
											params: {
												id: String(blueprintPathToShort(resource.item.path))
											}
										}">
									</UButton>
									<div class="flex flex-col gap-2">
										<div class="flex gap-2">
											<NuxtImg
												placeholder="/sf.png"
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
												:variant="
													IsPuritySelected(k, item.content as SFResourceNodeType, SFResourceNodePurity.impure)
														? 'solid'
														: 'outline'
												"
												@click="selectResourceAndPurity(k, item.content as SFResourceNodeType, SFResourceNodePurity.impure)">
												Impure ({{ resource.purity[SFResourceNodePurity.impure].count }})</UButton
											>
											<UButton
												v-if="!!resource.purity[SFResourceNodePurity.normal].count"
												class="flex-1"
												color="yellow"
												:variant="
													IsPuritySelected(k, item.content as SFResourceNodeType, SFResourceNodePurity.normal)
														? 'solid'
														: 'outline'
												"
												@click="selectResourceAndPurity(k, item.content as SFResourceNodeType, SFResourceNodePurity.normal)">
												Normal ({{ resource.purity[SFResourceNodePurity.normal].count }})</UButton
											>
											<UButton
												v-if="!!resource.purity[SFResourceNodePurity.pure].count"
												class="flex-1"
												color="green"
												:variant="
													IsPuritySelected(k, item.content as SFResourceNodeType, SFResourceNodePurity.pure)
														? 'solid'
														: 'outline'
												"
												@click="selectResourceAndPurity(k, item.content as SFResourceNodeType, SFResourceNodePurity.pure)">
												Pure ({{ resource.purity[SFResourceNodePurity.pure].count }})</UButton
											>
										</div>
									</div>
								</div>

								<div
									v-else
									class="relative flex h-fit w-full flex-col justify-items-center overflow-hidden rounded border bg-gray-100 p-1 dark:border-gray-950 dark:bg-gray-800">
									<div class="flex flex-col gap-2">
										<div class="flex gap-2">
											<NuxtImg
												placeholder="/sf.png"
												:src="`/map/${k}.png`"
												:alt="k"
												width="50"
												height="50"
												class="rounded border border-gray-700 bg-gray-900 p-1" />
											<div class="flex flex-1 flex-col">
												<span class="font-semibold">{{ typeToString(k as any) }}</span>
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
												:variant="
													IsPuritySelected(k, item.content as SFResourceNodeType, SFResourceNodePurity.impure)
														? 'solid'
														: 'outline'
												"
												@click="selectResourceAndPurity(k, item.content as SFResourceNodeType, SFResourceNodePurity.impure)">
												Impure ({{ resource.purity[SFResourceNodePurity.impure].count }})
											</UButton>
											<UButton
												v-if="!!resource.purity[SFResourceNodePurity.normal].count"
												class="flex-1"
												color="yellow"
												:variant="
													IsPuritySelected(k, item.content as SFResourceNodeType, SFResourceNodePurity.normal)
														? 'solid'
														: 'outline'
												"
												@click="selectResourceAndPurity(k, item.content as SFResourceNodeType, SFResourceNodePurity.normal)">
												Normal ({{ resource.purity[SFResourceNodePurity.normal].count }})
											</UButton>
											<UButton
												v-if="!!resource.purity[SFResourceNodePurity.pure].count"
												class="flex-1"
												color="green"
												:variant="
													IsPuritySelected(k, item.content as SFResourceNodeType, SFResourceNodePurity.pure)
														? 'solid'
														: 'outline'
												"
												@click="selectResourceAndPurity(k, item.content as SFResourceNodeType, SFResourceNodePurity.pure)">
												Pure ({{ resource.purity[SFResourceNodePurity.pure].count }})
											</UButton>
										</div>
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
