import cloneDeep from 'lodash/cloneDeep';
import type { UnwrapRef } from 'vue';

export function useRefDelay<T = any>(value: T | Ref<T>, onChange: (value: UnwrapRef<T>) => any = () => {}, timeout = 500) {
	const refValue: any = isRef(value) ? value : ref(value);
	const cached = ref(cloneDeep(refValue.value)!);
	const lastTimeout = ref<any>(null);

	watch(
		() => {
			return refValue.value;
		},
		() => {
			cached.value = cloneDeep(unref(refValue.value))!;
		},
		{ deep: true }
	);

	watch(
		() => {
			return cached;
		},
		() => {
			if (lastTimeout.value) {
				clearTimeout(lastTimeout.value);
			}

			lastTimeout.value = setTimeout(() => {
				refValue.value = unref(cached.value) as any;
				onChange(refValue.value);
			}, timeout);
		},
		{ deep: true }
	);

	return { input: cached, output: refValue };
}
