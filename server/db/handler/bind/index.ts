import { eq } from 'drizzle-orm';
import {
	buildables,
	cleaner,
	cleanerByPass,
	db,
	items,
	mapping,
	researchTree,
	researchTreeNodes,
	researchTreeSchematics
} from '~/server/db/index';
import { log } from '~/utils/logger/index';
import { blueprintPathToShort } from '~/utils/utils';
import { producedIn, recipes, recipesInput, recipesOutput } from '../../schema/recipes';
import {
	recipeUnlocks,
	scannerUnlocks,
	schematics,
	schematicsCosts,
	subSchematics
} from '../../schema/schematics';
import { wikiElement } from '../../schema/wiki';
import { SFDataType, WikiInformationType } from './../../../../utils/satisfactoryExtractorTypes';
import { extraInformations } from './../../schema/extraInformations';

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
			await db
				.update(recipes)
				.set({ isBuildableRecipe: true })
				.where(eq(recipes.path, data.path));
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
			.insert(mapping)
			.values({
				dataId: result.id,
				shortPath: blueprintPathToShort(result.path),
				type: SFDataType.cleaner,
				elPath: data.path,
				displayName: data.name ?? SFDataType.cleaner
			})
			.catch(() => {});

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

export async function tryGetProdElementFromType(type: WikiInformationType) {
	let buildablePath: string | null = null;
	switch (type) {
		case WikiInformationType.ExtractorConsumer:
			buildablePath =
				'/KLib/Assets/Buildings/ModularExtractor/Modules/Fluid/Build_Module_Fluid.Build_Module_Fluid_C';
			break;
		case WikiInformationType.AirCollector:
			buildablePath =
				'/KLib/Assets/Buildings/AirCollector/Build_AirCollector.Build_AirCollector_C';
			break;
		default:
			break;
	}
	if (!buildablePath) return null;
	return await db
		.select()
		.from(buildables)
		.where(eq(buildables.buildingPath, buildablePath))
		.then((r) => {
			return r.at(0) ? { type: 'buildable', data: r.at(0) } : null;
		});
}

export async function bindInformations(data: any) {
	if (!data.produced.length && !data.consumed.length) return;
	let { buildingPath: buildablePath, path: itemPath } = data;

	if (buildablePath) {
		buildablePath = itemPath;
		itemPath = null;
	} else buildablePath = null;

	const processConsumeProduce = async (data: any) => {
		return {
			...data,
			item: await db
				.select()
				.from(items)
				.where(eq(items.path, data.item))
				.then((r) => {
					return r.at(0) ?? {};
				})
		};
	};

	const processData = async (data: any) => {
		if (data.wasteProducer) {
			const result = await db
				.select()
				.from(recipes)
				.where(eq(recipes.path, data.wasteProducer))
				.then((r) => {
					return r.at(0) ?? null;
				});
			if (result) data.wasteProducer = result;
			else data.wasteProducer = null;
		} else data.wasteProducer = null;

		const result =
			(await tryGetProdElementFromType(data.type)) ??
			(await db
				.select()
				.from(recipes)
				.where(eq(recipes.path, data.wasteProducer))
				.then(async (r) => {
					return r.at(0)
						? { type: 'recipe', data: r.at(0) }
						: await db
								.select()
								.from(buildables)
								.where(eq(buildables.buildingPath, data.wasteProducer))
								.then((r) => {
									return r.at(0) ? { type: 'buildable', data: r.at(0) } : null;
								});
				}));
		if (result) data.productionElement = result;
		else data.productionElement = null;

		data.input = await Promise.all(data.input.map(processConsumeProduce));
		data.output = await Promise.all(data.output.map(processConsumeProduce));
		data.schematics = await Promise.all(
			data.schematics.map(async (schematicPath: string) => {
				return await db
					.select()
					.from(schematics)
					.where(eq(schematics.path, schematicPath))
					.then((r) => {
						return r.at(0);
					});
			})
		);

		return data;
	};

	data.consumed = await Promise.all(data.consumed.map(processData));
	data.produced = await Promise.all(data.produced.map(processData));

	await db
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
}
