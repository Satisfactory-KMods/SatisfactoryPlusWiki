import type { RouteParamsRaw } from '#vue-router';
import isEqual from 'lodash/isEqual';

/**
 * Reactively watch the params of the current route
 * @param defaults default params to set
 * @param event event to call when the params are updated
 * @return params and event as ref z
 * @example
 * const { params, refs, onParamsUpdated } = useParams({ search: '' }, () => {
 *    console.log('params updated', params);
 *    fetch(params.value.search);
 * });
 *
 * <input v-model="refs.search" />
 */
export function useParams<T extends RouteParamsRaw>(defaults: Partial<T>, event = () => {}) {
	const route = useRoute();
	const router = useRouter();
	const params = reactive<T>({ ...defaults, ...(route.params as any) });
	const onParamsUpdated = ref(event);

	for (const key in defaults) {
		if (!params[key]) params[key] = defaults[key] as any;
	}

	watch(
		() => {
			return route.params;
		},
		async () => {
			const watchKeys = Object.keys(defaults);
			let dirty = false;
			for (const key of watchKeys) {
				if (!isEqual(params[key], route.query[key])) {
					dirty = true;
					break;
				}
			}
			if (!dirty) return;

			await nextTick();
			Object.assign(params, route.params);
			onParamsUpdated.value();
		},
		{ immediate: true, deep: true }
	);

	function updateRoute() {
		// @ts-ignore
		router.push({ params: unref(params), query: route.query, hash: route.hash });
	}

	function setParams(newParams: Partial<T>) {
		Object.assign(params, newParams);
		updateRoute();
	}

	return { params: readonly(params), refs: toRefs(params), onParamsUpdated, updateRoute, setParams };
}
