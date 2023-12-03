import isEqual from 'lodash/isEqual';

export type LastVisitElement = {
	name: string;
	path: string;
};

export const useLastVisit = defineStore(
	'last_visit_store',
	() => {
		const lastVisitArray = ref<LastVisitElement[]>([]);

		const addVisit = (path: LastVisitElement) => {
			if (
				lastVisitArray.value.find((v) => {
					return isEqual(v, path);
				})
			) {
				return;
			}

			if (lastVisitArray.value.length > 10) {
				lastVisitArray.value.pop();
			}
			lastVisitArray.value.unshift(path);
		};

		return {
			data: lastVisitArray,
			addVisit
		};
	},
	{
		persist: {
			storage: persistedState.localStorage
		}
	}
);
