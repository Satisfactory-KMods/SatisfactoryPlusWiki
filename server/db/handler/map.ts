import fs from 'fs/promises';
import { join } from 'path';
import { db } from '~/server/db';
import { log } from '~/utils/logger';
import { mapTable } from '../schema/map';

export async function handleJsonData(data: any) {
	delete data.dataType;
	for (const [itemPath, locData] of Object.entries<any>(data)) {
		if (locData.type === 'pickup') continue;
		await Promise.all(
			locData.locations.map(async (location: any) => {
				await db
					.insert(mapTable)
					.values({
						itemPath,
						noRelItemPath: itemPath,
						type: locData.type,
						x: location.x,
						y: location.y,
						z: location.z,
						purity: location.purity,
						itemAmounts: location.itemAmounts,
						satelites: location.Satelites
					})

					.catch(() => {
						return db
							.insert(mapTable)
							.values({
								itemPath: null,
								noRelItemPath: itemPath,
								type: locData.type,
								x: location.x,
								y: location.y,
								z: location.z,
								purity: location.purity,
								itemAmounts: location.itemAmounts,
								satelites: location.Satelites
							})
							.catch((err: any) => {
								log('error', 'cannot create map element for item:', itemPath, err.message);
							});
					});
			})
		);
	}
}

export async function read(filePath: string) {
	const paths = await fs.readdir(filePath, { withFileTypes: true });
	await Promise.all(
		paths.map(async (path) => {
			if (path.isFile() && path.name.endsWith('.json')) {
				let data = await fs.readFile(join(filePath, path.name), 'utf-8');
				if (data.charCodeAt(0) === 0xfeff) {
					data = data.substr(1);
				}
				await handleJsonData(JSON.parse(data));
			}
		})
	);
}

export async function map() {
	await read(join(process.cwd(), 'public/sf/map'));
	return null;
}
