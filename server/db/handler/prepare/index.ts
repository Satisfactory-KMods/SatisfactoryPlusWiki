import { log } from '~/utils/logger';
import { buildables, db, items, researchTree, schematics } from '../..';
import { recipes } from '../../schema/recipes';

export async function prepareItems(data: any) {
	await db
		.insert(items)
		.values(data)
		.catch((err) => {
			log('warn', data.name, err.message);
		});
	return await Promise.resolve(data);
}

export async function prepareResearchTree(data: any) {
	await db
		.insert(researchTree)
		.values(data)
		.catch((err) => {
			log('warn', data.name, err.message);
		});
	return await Promise.resolve(data);
}

export async function prepareResourceMap(data: any) {
	return await Promise.resolve(data);
}

export async function prepareBuildable(data: any) {
	data.path = data.buildingPath ?? data.path;
	await db
		.insert(buildables)
		.values(data)
		.catch((err) => {
			log('warn', data.name, err.message);
		});
	return await Promise.resolve(data);
}

export async function prepareRecipe(data: any) {
	await db
		.insert(recipes)
		.values(data)
		.catch((err) => {
			log('warn', data.name, err.message);
		});
	return await Promise.resolve(data);
}

export async function prepareCleaner(data: any) {
	return await Promise.resolve(data);
}

export async function prepareSchematic(data: any) {
	await db
		.insert(schematics)
		.values(data)
		.catch((err) => {
			log('warn', data.name, err.message);
		});
	return await Promise.resolve(data);
}

export async function prepareInformations(data: any) {
	return await Promise.resolve(data);
}
