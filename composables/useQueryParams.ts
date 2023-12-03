import type { RouteParamsRaw } from '#vue-router';
import isEqual from 'lodash/isEqual';

/**
 * Reactively watch the query of the current route
 * @param defaults default params to set
 * @param event event to call when the params are updated
 * @return params and event as ref z
 * @example
 * const { params, refs, onParamsUpdated } = useQueryParams({ search: '' }, () => {
 *    console.log('params updated', params);
 *    fetch(params.value.search);
 * });
 *
 * <input v-model="refs.search" />
 */
export function useQueryParams<T extends RouteParamsRaw>(defaults: Partial<T>, event = () => {}) {
	const route = useRoute();
	const router = useRouter();
	const params = reactive<T>({ ...defaults, ...(route.query as any) });
	const onParamsUpdated = ref(event);
	const refs = toRefs(params);

	watch(
		() => {
			return route.query;
		},
		async () => {
			const watchKeys = Object.keys(defaults);
			let dirty = false;
			for (const key of watchKeys) {
				if (route.query[key] !== undefined && !isEqual(params[key], route.query[key])) {
					dirty = true;
					break;
				}
			}
			if (!dirty) return;

			await nextTick();
			Object.assign(params, route.query);
			onParamsUpdated.value && onParamsUpdated.value();
		},
		{ deep: true }
	);

	function updateRoute() {
		// @ts-ignore
		router.push({ query: unref(params), params: route.params, hash: route.hash });
		onParamsUpdated.value && onParamsUpdated.value();
	}

	function setParams(newParams: Partial<T>) {
		Object.assign(params, newParams);
		updateRoute();
	}

	return { params: readonly(params), refs, onParamsUpdated, updateRoute, setParams };
}
