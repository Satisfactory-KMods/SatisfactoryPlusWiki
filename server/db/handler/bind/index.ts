import { eq } from 'drizzle-orm';
import type { Nullish } from '~/utils/logger/index';
import { log } from '~/utils/logger/index';
import { cleaner, cleanerByPass, db, researchTree, researchTreeNodes, researchTreeSchematics } from '../..';
import { producedIn, recipes, recipesInput, recipesOutput } from '../../schema/recipes';
import { recipeUnlocks, scannerUnlocks, schematics, schematicsCosts, subSchematics } from '../../schema/schematics';
import { wikiElement } from '../../schema/wiki';
import { extraInformations, extraRecipe, extraRecipeInput, extraRecipeOutput, extraRecipeSchematics } from './../../schema/extraInformations';

export async function bindItems(data: any) {
	return await Promise.resolve(data);
}

export async function bindResearchTree(data: any) {
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

export async function bindResourceMap(data: any) {
	return await Promise.resolve(data);
}

export async function bindBuildable(data: any) {
	data.path = data.buildingPath ?? data.path;
	return await Promise.resolve(data);
}

export async function bindRecipe(data: any) {
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
		if (data.producedIn.length === 0) {
			await db.update(recipes).set({ isBuildableRecipe: true }).where(eq(recipes.path, data.path));
		} else {
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

export async function bindCleaner(data: any) {
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
		await db
			.insert(wikiElement)
			.values({
				elPath: data.path
			})
			.catch(() => {});

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

export async function bindSchematic(data: any) {
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

export async function bindInformations(data: any) {
	if (!data.produced.length && !data.consumed.length) return;
	let buildablePath: Nullish<string> = null;
	let itemPath: Nullish<string> = null;

	if (data.buildingPath.length > 0) {
		buildablePath = data.buildingPath;
	} else {
		itemPath = data.path;
	}

	const extraInfo = await db
		.insert(extraInformations)
		.values({
			...data,
			buildablePath,
			itemPath
		})
		.returning()
		.then((r) => {
			return r.at(0);
		})
		.catch((err) => {
			log('error', data.name, err.message);
		});
	if (!extraInfo) return;

	const write = async (recipe: any, usedIn: Nullish<string> = null, producedIn: Nullish<string> = null) => {
		const extraRecipes = await await db
			.insert(extraRecipe)
			.values({
				...recipe,
				usedIn,
				producedIn
			})
			.returning()
			.then((r) => {
				return r.at(0);
			})
			.catch((err) => {
				log('warn', extraInfo.id, recipe.path, data.name, err.message);
				return null;
			});

		if (!extraRecipes) return;

		await Promise.all([
			...recipe.schematics.map((schematicPath: any) => {
				return db
					.insert(extraRecipeSchematics)
					.values({
						extraRecipe: extraRecipes.id,
						schematicPath
					})
					.catch((err) => {
						log('warn', extraInfo.id, extraRecipes.id, schematicPath, err.message);
						return null;
					});
			})
		]);
		await Promise.all([
			...recipe.input.map((el: any) => {
				return db
					.insert(extraRecipeInput)
					.values({
						extraRecipe: extraRecipes.id,
						itemPath: el.item,
						...el
					})
					.catch((err) => {
						log('warn', extraInfo.id, extraRecipes.id, el.item, err.message);
						return null;
					});
			})
		]);
		await Promise.all([
			...recipe.output.map((el: any) => {
				return db
					.insert(extraRecipeOutput)
					.values({
						extraRecipe: extraRecipes.id,
						itemPath: el.item,
						...el
					})
					.catch((err) => {
						log('warn', extraInfo.id, extraRecipes.id, el.item, err.message);
						return null;
					});
			})
		]);
	};

	await Promise.all([
		...data.consumed.map((consumed: any) => {
			return write(consumed, extraInfo.id);
		}),
		...data.produced.map((produced: any) => {
			return write(produced, null, extraInfo.id);
		})
	]);

	return await Promise.resolve(data);
}
