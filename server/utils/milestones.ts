import { and, eq, inArray } from 'drizzle-orm';
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
