import { env } from '~/env.mjs';
import {
	buildables,
	db,
	items,
	producedIn,
	recipeUnlocks,
	recipes,
	recipesInput,
	recipesOutput,
	researchTree,
	researchTreeNodes,
	researchTreeSchematics,
	scannerUnlocks,
	schematics,
	schematicsCosts,
	startMigrate,
	subSchematics
} from '~/server/db';
import { log } from '~/utils/logger';
import { startReadingData } from '../db/handler';
import { cleaner, cleanerByPass } from '../db/schema/cleaners';
import { mapTable } from '../db/schema/map';

export default defineNitroPlugin(async () => {
	await startMigrate();
	if (env.NODE_ENV !== 'development') {
		log('info', `Clearing database...`);

		await db.delete(cleaner);
		await db.delete(cleanerByPass);
		await db.delete(recipes);
		await db.delete(recipesInput);
		await db.delete(producedIn);
		await db.delete(recipesOutput);
		await db.delete(researchTree);
		await db.delete(researchTreeNodes);
		await db.delete(researchTreeSchematics);
		await db.delete(subSchematics);
		await db.delete(scannerUnlocks);
		await db.delete(schematicsCosts);
		await db.delete(recipeUnlocks);
		await db.delete(buildables);
		await db.delete(schematics);
		await db.delete(mapTable);
		await db.delete(items);

		log('info', `Finished clearing database!`);
		await startReadingData();
	}
});
