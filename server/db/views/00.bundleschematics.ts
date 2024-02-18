import { db, dbSchema, schematics } from '..';

export const viewBundleSchematic = dbSchema.view('view_bundle_schematics').as(() => {
	return db.select().from(schematics);
});
