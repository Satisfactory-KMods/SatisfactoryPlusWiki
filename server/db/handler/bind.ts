import fs from 'fs/promises';
import { join } from 'path';
import type { Nullish } from '~/utils/logger';
import { SFDataType } from '~/utils/satisfactoryExtractorTypes';
import { bindBuildable, bindCleaner, bindInformations, bindItems, bindRecipe, bindResearchTree, bindResourceMap, bindSchematic } from './bind/index';

export async function handleJsonData(data: any) {
	const dataType: Nullish<SFDataType> = data.dataType;
	if (dataType) {
		switch (dataType) {
			case SFDataType.buildable:
				await bindBuildable(data);
				break;
			case SFDataType.recipe:
				await bindRecipe(data);
				break;
			case SFDataType.cleaner:
				await bindCleaner(data);
				break;
			case SFDataType.schematic:
				await bindSchematic(data);
				break;
			case SFDataType.informations:
				await bindInformations(data);
				break;
			case SFDataType.itemDescriptor:
				await bindItems(data);
				break;
			case SFDataType.food:
				await bindItems(data);
				break;
			case SFDataType.resourceMap:
				await bindResourceMap(data);
				break;
			case SFDataType.researchTree:
				await bindResearchTree(data);
				break;
		}
	}
}

export async function read(filePath: string) {
	const paths = await fs.readdir(filePath, { withFileTypes: true });
	await Promise.all(
		paths.map(async (path) => {
			if (path.isDirectory()) {
				await read(join(filePath, path.name));
			} else if (path.isFile() && path.name.endsWith('.json')) {
				let data = await fs.readFile(join(filePath, path.name), 'utf-8');
				if (data.charCodeAt(0) === 0xfeff) {
					data = data.substr(1);
				}
				await handleJsonData(JSON.parse(data));
			}
		})
	);
}

export async function bind() {
	await read(join(process.cwd(), 'public/sf'));
	return null;
}
