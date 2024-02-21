import { defineStore } from 'pinia';

export const useSpoilerMode = defineStore(
	'spoilerMode',
	() => {
		const active = ref(false);

		function toggle() {
			active.value = !active.value;
		}

		return {
			active,
			toggle
		};
	},
	{
		persist: {
			paths: ['active']
		}
	}
);
