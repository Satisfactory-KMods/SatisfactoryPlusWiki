import fs from 'fs/promises';
import { join } from 'path';
import { type Nullish } from '~/utils/logger';
import { SFDataType } from '~/utils/satisfactoryExtractorTypes';
import {
	prepareBuildable,
	prepareCleaner,
	prepareInformations,
	prepareItems,
	prepareRecipe,
	prepareResearchTree,
	prepareResourceMap,
	prepareSchematic
} from './prepare/index';

export async function handleJsonData(data: any, postPrepare: any[]) {
	const dataType: Nullish<SFDataType> = data.dataType;
	if (dataType) {
		switch (dataType) {
			case SFDataType.buildable:
				await prepareBuildable(data);
				await prepareItems(data, true);
				break;
			case SFDataType.recipe:
				await prepareRecipe(data);
				break;
			case SFDataType.cleaner:
				await prepareCleaner(data);
				break;
			case SFDataType.schematic:
				await prepareSchematic(data);
				break;
			case SFDataType.informations:
			case SFDataType.informationBuildings:
				postPrepare.push(data);
				break;
			case SFDataType.itemDescriptor:
				await prepareItems(data);
				break;
			case SFDataType.food:
				await prepareItems(data);
				break;
			case SFDataType.resourceMap:
				await prepareResourceMap(data);
				break;
			case SFDataType.researchTree:
				await prepareResearchTree(data);
				break;
		}
	}
}

export async function read(filePath: string) {
	const paths = await fs.readdir(filePath, { withFileTypes: true });
	const postPrepare: any[] = [];
	await Promise.all(
		paths.map(async (path) => {
			if (path.isDirectory()) {
				await read(join(filePath, path.name));
			} else if (path.isFile() && path.name.endsWith('.json')) {
				let data = await fs.readFile(join(filePath, path.name), 'utf-8');
				if (data.charCodeAt(0) === 0xfeff) {
					data = data.substr(1);
				}
				await handleJsonData(JSON.parse(data), postPrepare);
			}
		})
	);
	await Promise.all(postPrepare.map(prepareInformations));
}

export async function prepare() {
	await read(join(process.cwd(), 'public/sf'));
	return null;
}
