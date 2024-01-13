import { db } from '../db/index';

export async function getMapData() {
	const mapData = await db.query.mapTable.findMany({
		columns: {
			itemPath: false,
			noRelItemPath: false
		},
		with: {
			item: {
				columns: {
					id: true,
					image: true,
					path: true,
					name: true,
					form: true
				}
			}
		}
	});

	return mapData.reduce<Record<string, (typeof mapData)[0][]>>((acc, mapData) => {
		const itemPath = mapData.item?.path;
		if (!itemPath) {
			return acc;
		}

		if (!acc[itemPath]) {
			acc[itemPath] = [];
		}
		acc[itemPath].push(mapData as any);
		return acc;
	}, {});
}
