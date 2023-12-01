import { eq } from 'drizzle-orm';
import { log } from '~/utils/logger';
import { cleaner, cleanerByPass, db, researchTree, researchTreeNodes, researchTreeSchematics } from '../..';
import { producedIn, recipes, recipesInput, recipesOutput } from '../../schema/recipes';
import { recipeUnlocks, scannerUnlocks, schematics, schematicsCosts, subSchematics } from '../../schema/schematics';

export async function prepareItems(data: any) {
	return await Promise.resolve(data);
}

export async function prepareResearchTree(data: any) {
	const result = await db
		.select()
		.from(researchTree)
		.where(eq(researchTree.path, data.path))
		.then((r) => {
			return r.at(0);
		});
	if (result) {
		for (const node of data.nodes) {
			await db.insert(researchTreeNodes).values({
				treePath: result.path,
				schematicPath: node.path,
				...node
			});
		}
		for (const schematicPath of data.schematics) {
			await db.insert(researchTreeSchematics).values({
				treePath: result.path,
				schematicPath: String(schematicPath)
			});
		}
	}
	return await Promise.resolve(data);
}

export async function prepareResourceMap(data: any) {
	return await Promise.resolve(data);
}

export async function prepareBuildable(data: any) {
	data.path = data.buildingPath ?? data.path;
	return await Promise.resolve(data);
}

export async function prepareRecipe(data: any) {
	const result = await db
		.select()
		.from(recipes)
		.where(eq(recipes.path, data.path))
		.then((r) => {
			return r.at(0);
		});

	if (!result) {
		log('error', data.name, 'not found');
	}

	if (result) {
		for (const producedInEl of data.producedIn) {
			await db
				.insert(producedIn)
				.values({
					recipePath: result.path,
					buildingPath: producedInEl
				})
				.catch((err) => {
					log('warn', data.name, producedInEl, err.message);
				});
		}
		for (const input of data.input) {
			await db
				.insert(recipesInput)
				.values({
					recipePath: result.path,
					itemPath: input.item,
					amount: input.amount
				})
				.catch((err) => {
					log('warn', data.name, input.item, err.message);
				});
		}
		for (const output of data.output) {
			await db
				.insert(recipesOutput)
				.values({
					recipePath: result.path,
					itemPath: output.item,
					amount: output.amount
				})
				.catch((err) => {
					log('warn', data.name, output.item, err.message);
				});
		}
	}
	return await Promise.resolve(data);
}

export async function prepareCleaner(data: any) {
	if (data.outFluid.startsWith('Class')) data.outFluid = null;
	const result = await db
		.insert(cleaner)
		.values(data)
		.returning()
		.then((r) => {
			return r.at(0) ?? null;
		})
		.catch((err) => {
			log('warn', data.name, data, err.message);
			return null;
		});

	if (result) {
		for (const bypass of data.bypass) {
			await db
				.insert(cleanerByPass)
				.values({
					cleanerPath: result.path,
					itemPath: bypass.item,
					time: bypass.time,
					amount: bypass.amount
				})
				.catch((err) => {
					log('warn', data.name, bypass.item, err.message);
				});
		}
	}

	return await Promise.resolve(data);
}

export async function prepareSchematic(data: any) {
	const result = await db
		.select()
		.from(schematics)
		.where(eq(schematics.path, data.path))
		.then((r) => {
			return r.at(0);
		});

	if (result) {
		for (const cost of data.cost) {
			await db
				.insert(schematicsCosts)
				.values({
					schematicPath: result.path,
					itemPath: cost.item,
					amount: cost.amount
				})
				.catch((err) => {
					log('warn', data.name, cost.item, err.message);
				});
		}

		for (const subSchematic of data.subSchematics) {
			await db
				.insert(subSchematics)
				.values({
					schematicPath: result.path,
					subSchematicPath: subSchematic
				})
				.catch((err) => {
					log('warn', data.name, subSchematic, err.message);
				});
		}

		for (const scanner of data.scannerUnlocks) {
			await db
				.insert(scannerUnlocks)
				.values({
					schematicPath: result.path,
					itemPath: scanner
				})
				.catch((err) => {
					log('warn', data.name, scanner, err.message);
				});
		}

		for (const recipePath of data.recipeUnlocks) {
			await db
				.insert(recipeUnlocks)
				.values({
					schematicPath: result.path,
					recipePath
				})
				.catch((err) => {
					log('warn', data.name, recipePath, err.message);
				});
		}
	}
	return await Promise.resolve(data);
}

export async function prepareInformations(data: any) {
	return await Promise.resolve(data);
}
