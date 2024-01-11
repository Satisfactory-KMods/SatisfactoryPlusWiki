<script lang="ts" setup>
	import { CRS, LatLngBounds } from 'leaflet';

	const {data, status, error} = useFetch('/api/resource-map/data');

	const readyForMarkers = ref(false);
	const map = ref();

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
		let t = e[0] || 0;
		let a = e[1] || 0;
		const s = Math.abs(mappingBoundWest) + Math.abs(mappingBoundEast);
		const r = Math.abs(mappingBoundNorth) + Math.abs(mappingBoundSouth);
		const i = Math.abs(backgroundSize) / s;
		const o = Math.abs(backgroundSize) / r;

		/*if( t > 0 ) {
			t = t - ( t * ( t / mappingBoundEast / ( 13.35 * ( t / mappingBoundEast ) ) ) );
		} 		else {
			t = t - ( t * ( ( t ) / mappingBoundWest / ( 9.2 * ( t / mappingBoundWest ) ) ) );
		}*/

		t = (s - mappingBoundEast + t) * i;
		a = (r - mappingBoundNorth + a) * o - backgroundSize;

		return map.unproject([t, a], zoomRatio);
	}

	onMounted(() => {
		const timer = setInterval(() => {
			if (!map.value?.leafletObject) return;
			mapConfig.value = update();
			readyForMarkers.value = true;
			clearInterval(timer);
		});
	});
</script>

<template>
	<div class="flex flex-col">
		<div class="flex flex-col items-center gap-4 px-10 py-3 text-center">
			<div class="text-primary text-5xl font-semibold">Resource Map</div>

			<div class="h-[600px] w-full">
				<LMap
					ref="map"
					:zoom="mapConfig.zoom"
					:center="[0, 0]"
					:min-zoom="config.minTileZoom"
					:max-zoom="config.maxTileZoom"
					:bounds="mapConfig.bounds"
					:max-bounds="mapConfig.maxBounds">
					<LTileLayer url="https://kyrium.space/static/new-map/prod/{z}/{x}/{y}.png"></LTileLayer>
					<LMarker :lat-lng="[0, 80]"></LMarker>
				</LMap>
			</div>
		</div>
	</div>
</template>
