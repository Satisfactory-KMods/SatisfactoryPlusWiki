import type { MapTableFull } from '../db/index';
import { db } from '../db/index';
export function getMapData() {
	return db.query.mapTable
		.findMany({
			with: {
				item: true
			}
		})
		.then((mapData) => {
			// we group the map data by itempath
			return mapData.reduce<Record<string, MapTableFull[]>>((acc, mapData) => {
				const itemPath = mapData.itemPath;
				if (!itemPath) {
					return acc;
				}

				if (!acc[itemPath]) {
					acc[itemPath] = [];
				}
				acc[itemPath].push(mapData as any);
				return acc;
			}, {});
		});
}
