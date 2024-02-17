import { count, eq, isNull, notInArray, sql } from 'drizzle-orm';
import type { SFItemForm } from '~/utils/satisfactoryExtractorTypes';
import { SFSchematicType } from '~/utils/satisfactoryExtractorTypes';
import {
	db,
	dbSchema,
	items,
	mapping,
	recipeUnlocks,
	scannerUnlocks,
	schematics,
	schematicsCosts,
	subSchematics
} from '..';
import { wikiElement } from '../schema/wiki';

export const viewBundleSchematic = dbSchema.materializedView('view_bundle_schematics').as(() => {
		return db
			.select()
			.from(schematics);
	})
