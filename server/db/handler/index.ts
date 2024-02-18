import { eq, inArray, sql } from 'drizzle-orm';
import cloneDeep from 'lodash/cloneDeep';
import { buildables, db, items } from '~/server/db/index';
import { log } from '~/utils/logger';
import { bind } from './bind';
import { map } from './map';
import { prepare } from './prepare';

export async function startReadingData() {
	log('info', `prepare data...`);
	await prepare();
	log('info', `bind data...`);
	await bind();
	log('info', `prepare map...`);
	await map();
	log('info', `Cleanup Data and merge informations`);
	await merge();
	log('info', `Finished data prepare...`);
}

function attachmentToBuildable(attachment: any) {
	switch (attachment) {
		case '/KLib/Assets/Buildings/ModularExtractor/Attachments/ModuleAttachment_Drill.ModuleAttachment_Drill_C':
			return '/KLib/Assets/Buildings/ModularExtractor/Desc/BuildDesc_Module_Drill_T3.BuildDesc_Module_Drill_T3_C';
		case '/KLib/Assets/Buildings/ModularExtractor/Attachments/ModuleAttachment_Fluid.ModuleAttachment_Fluid_C':
			return '/KLib/Assets/Buildings/ModularExtractor/Desc/BuildDesc_Module_Fluid.BuildDesc_Module_Fluid_C';
		case 'SeedExtractor':
			return 'SeedExtractor';
		case 'SlugHatcher':
			return 'SlugHatcher';
		default:
			if (typeof attachment === 'string') {
				log('fatal', `Attachment not found:`, attachment);
			}
			return String(attachment);
	}
}

export async function merge() {
	const foundItems = await db
		.select()
		.from(items)
		.where(
			sql`${items.itemTypeInformation}->>'type'::varchar != 'normal'::varchar AND ${items.itemTypeInformation}->>'updated' is null`
		)
		.orderBy(sql`${items.itemTypeInformation}->>'type'::varchar`);
	await Promise.all(
		foundItems.map(async (i) => {
			log('info', `Merging: ${i.name}`);
			const item = cloneDeep(i);
			if (item.itemTypeInformation.type === 'miner') {
				if (item.itemTypeInformation.neededModules.length) {
					item.itemTypeInformation.neededModules = await db
						.select()
						.from(buildables)
						.where(
							inArray(
								buildables.path,
								item.itemTypeInformation.neededModules.map(attachmentToBuildable)
							)
						);
				}

				if (item.itemTypeInformation.preventModules.length) {
					item.itemTypeInformation.preventModules = await db
						.select()
						.from(buildables)
						.where(
							inArray(
								buildables.buildingPath,
								item.itemTypeInformation.preventModules as any
							)
						);
				}

				for (const fluid of item.itemTypeInformation.fluidInfos) {
					fluid.path =
						(await db
							.select()
							.from(items)
							.where(eq(items.path, fluid.path as any))
							.then((r) => {
								return r.at(0);
							})) ?? fluid.path;
				}

				for (const fluid of item.itemTypeInformation.modulInformation) {
					fluid.path =
						(await db
							.select()
							.from(buildables)
							.where(eq(items.path, fluid.path as any))
							.then((r) => {
								return r.at(0);
							})) ?? fluid.path;
					fluid.productionItem =
						(await db
							.select()
							.from(items)
							.where(eq(items.path, fluid.productionItem as any))
							.then((r) => {
								return r.at(0);
							})) ?? fluid.productionItem;
					fluid.trashItem =
						(await db
							.select()
							.from(items)
							.where(eq(items.path, fluid.trashItem as any))
							.then((r) => {
								return r.at(0);
							})) ?? fluid.trashItem;
				}

				item.itemTypeInformation.updated = true;
			} else if (item.itemTypeInformation.type === 'egg') {
				if (item.itemTypeInformation.fluid) {
					item.itemTypeInformation.fluid = await db
						.select()
						.from(items)
						.where(eq(items.path, item.itemTypeInformation.fluid as any))
						.then((r) => {
							return r.at(0) ?? null;
						});
				} else item.itemTypeInformation.fluid = null;
				if (item.itemTypeInformation.possibleSlugs.length) {
					item.itemTypeInformation.possibleSlugs = await db
						.select()
						.from(items)
						.where(inArray(items.path, item.itemTypeInformation.possibleSlugs as any));
				}
				item.itemTypeInformation.updated = true;
			} else if (item.itemTypeInformation.type === 'slug') {
				item.itemTypeInformation.egg = await db
					.select()
					.from(items)
					.where(eq(items.path, item.itemTypeInformation.egg as any))
					.then((r) => {
						return r.at(0) ?? ({} as any);
					});

				item.itemTypeInformation.food = await db
					.select()
					.from(items)
					.where(eq(items.path, item.itemTypeInformation.food as any))
					.then((r) => {
						return r.at(0) ?? ({} as any);
					});

				if (item.itemTypeInformation.comfortableWith.length) {
					item.itemTypeInformation.comfortableWith = await db
						.select()
						.from(items)
						.where(
							inArray(items.path, item.itemTypeInformation.comfortableWith as any)
						);
				}

				item.itemTypeInformation.updated = true;
			}

			await db.update(items).set(item).where(eq(items.id, item.id));
		})
	);
}
