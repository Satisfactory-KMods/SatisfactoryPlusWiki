import { SFDataType } from '~/utils/satisfactoryExtractorTypes';
import { blueprintPathToShort } from '~/utils/utils';
import { buildables, db, items, mapping, researchTree, schematics } from '../..';
import { recipes } from '../../schema/recipes';
import { wikiElement } from './../../schema/wiki';

export async function prepareItems(data: any) {
	await db
		.insert(items)
		.values(data)
		.returning()
		.then(async (r) => {
			const d = r.at(0);
			if (!d) return;

			await db
				.insert(mapping)
				.values({
					displayName: d.name,
					dataId: d.id,
					elPath: d.path,
					shortPath: blueprintPathToShort(d.path),
					type: SFDataType.itemDescriptor
				})
				.catch(() => {});
		})
		.catch(() => {});
	await db
		.insert(wikiElement)
		.values({
			elPath: data.path
		})
		.catch(() => {});
	return await Promise.resolve(data);
}

export async function prepareResearchTree(data: any) {
	await db
		.insert(researchTree)
		.values(data)
		.returning()
		.then(async (r) => {
			const d = r.at(0);
			if (!d) return;

			await db
				.insert(mapping)
				.values({
					displayName: d.name,
					dataId: d.id,
					elPath: d.path,
					shortPath: blueprintPathToShort(d.path),
					type: SFDataType.researchTree
				})
				.catch(() => {});
		})
		.catch(() => {});
	await db
		.insert(wikiElement)
		.values({
			elPath: data.path
		})
		.catch(() => {});
	return await Promise.resolve(data);
}

export async function prepareResourceMap(data: any) {
	return await Promise.resolve(data);
}

export async function prepareBuildable(data: any) {
	if (data.buildingPath !== data.path && !!data.buildingPath) {
		await db
			.insert(buildables)
			.values(data)
			.returning()
			.then(async (r) => {
				const d = r.at(0);
				if (!d) return;

				await db
					.insert(mapping)
					.values({
						displayName: d.name,
						dataId: d.id,
						elPath: d.path,
						shortPath: blueprintPathToShort(d.path),
						type: SFDataType.buildable
					})
					.catch(() => {});
			})
			.catch(() => {});
		await db
			.insert(wikiElement)
			.values({
				elPath: data.path
			})
			.catch(() => {});
		return await Promise.resolve(data);
	}
}

export async function prepareRecipe(data: any) {
	await db
		.insert(recipes)
		.values(data)
		.returning()
		.then(async (r) => {
			const d = r.at(0);
			if (!d) return;

			await db
				.insert(mapping)
				.values({
					displayName: d.name,
					dataId: d.id,
					elPath: d.path,
					shortPath: blueprintPathToShort(d.path),
					type: SFDataType.recipe
				})
				.catch(() => {});
		})
		.catch(() => {});
	await db
		.insert(wikiElement)
		.values({
			elPath: data.path
		})
		.catch(() => {});
	return await Promise.resolve(data);
}

export async function prepareCleaner(data: any) {
	return await Promise.resolve(data);
}

export async function prepareSchematic(data: any) {
	await db
		.insert(schematics)
		.values({
			...data,
			image: data.image ?? data.smallImage,
			smallImage: data.smallImage ?? data.image
		})
		.returning()
		.then(async (r) => {
			const d = r.at(0);
			if (!d) return;

			await db
				.insert(mapping)
				.values({
					displayName: d.name,
					dataId: d.id,
					elPath: d.path,
					shortPath: blueprintPathToShort(d.path),
					type: SFDataType.schematic
				})
				.catch(() => {});
		})
		.catch(() => {});
	await db
		.insert(wikiElement)
		.values({
			elPath: data.path
		})
		.catch(() => {});
	return await Promise.resolve(data);
}

export async function prepareInformations(data: any) {
	return await Promise.resolve(data);
}
