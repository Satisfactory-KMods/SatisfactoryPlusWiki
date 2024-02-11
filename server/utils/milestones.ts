import { and, count, eq, inArray } from 'drizzle-orm';
import { SFSchematicType } from '~/utils/satisfactoryExtractorTypes';
import { db } from '../db';
import { matMilestones } from '../db/mat';

export function getMilestonesByTier(tier: number) {
	return db
		.select({
			name: matMilestones.name,
			image: matMilestones.image,
			tier: matMilestones.tier,
			type: matMilestones.type,
			category: matMilestones.category,
			views: matMilestones.views,
			handslots: matMilestones.handslots,
			inventorySlots: matMilestones.inventorySlots,
			time: matMilestones.time,
			recipeCount: matMilestones.recipeCount,
			scannerUnlockCount: matMilestones.scannerUnlockCount,
			short: matMilestones.short,
			costs: matMilestones.costs
		})
		.from(matMilestones)
		.where(and(eq(matMilestones.tier, tier), inArray(matMilestones.type, [SFSchematicType.Tutorial, SFSchematicType.Milestone])))
		.orderBy(matMilestones.name);
}

export function getShopCategories() {
	const subQuery = db.$with('subQuery').as(
		db
			.select({
				category: matMilestones.category,
				milestones: pgAggJsonBuildObject({
					name: matMilestones.name
				}).as('milestones')
			})
			.from(matMilestones)
			.where(inArray(matMilestones.type, [SFSchematicType.ResourceSink]))
			.orderBy(matMilestones.name)
	);

	return db
		.with(subQuery)
		.select({
			category: subQuery.category,
			unlocks: count(subQuery.milestones)
		})
		.from(subQuery)
		.groupBy(matMilestones.category)
		.orderBy(subQuery.category);
}

export function getShopMilestonesByCategoryGrouped(category: string) {
	const subQuery = db.$with('subQuery').as(
		db
			.select({
				category: matMilestones.category,
				subCategory: matMilestones.subCategory,
				milestones: pgAggJsonBuildObject({
					name: matMilestones.name,
					image: matMilestones.image,
					views: matMilestones.views,
					recipeCount: matMilestones.recipeCount,
					short: matMilestones.short,
					costs: matMilestones.costs
				}).as('milestones')
			})
			.from(matMilestones)
			.where(inArray(matMilestones.type, [SFSchematicType.ResourceSink]))
			.orderBy(matMilestones.name)
	);

	return db
		.with(subQuery)
		.select({
			category: subQuery.category,
			subCategory: subQuery.subCategory,
			milestones: pgAggJsonArray(subQuery.milestones).as('milestones')
		})
		.from(subQuery)
		.where(eq(subQuery.category, category))
		.groupBy(matMilestones.subCategory, matMilestones.category)
		.orderBy(subQuery.subCategory);
}
