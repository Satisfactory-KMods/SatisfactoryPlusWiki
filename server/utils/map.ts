import { SFResourceNodeType } from '~/utils/satisfactoryExtractorTypes';
import { db } from '../db/index';

export async function getMapData() {
	const mapData = await db.query.mapTable.findMany({
		columns: {
			itemPath: false,
			noRelItemPath: false,
			type: true,
			purity: true,
			satelites: true,
			x: true,
			y: true,
			z: true,
			id: true
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
			const isLootCheck = mapData.type === SFResourceNodeType.lootChests;
			if (isLootCheck) {
				if (!acc[SFResourceNodeType.lootChests]) {
					acc[SFResourceNodeType.lootChests] = [];
				}
				acc[SFResourceNodeType.lootChests].push(mapData as any);
			}
			return acc;
		}

		if (!acc[itemPath]) {
			acc[itemPath] = [];
		}
		acc[itemPath].push(mapData as any);
		return acc;
	}, {});
}
