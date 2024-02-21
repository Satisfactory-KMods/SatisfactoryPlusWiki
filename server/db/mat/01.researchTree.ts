import {
	createAutomaticMaterilizedView,
	pgAggJsonBuildObject,
	pgBoolOr,
	pgCast,
	pgJsonAggCoal
} from '@kmods/drizzle-orm-utils';
import { eq, isNotNull, sql } from 'drizzle-orm';
import { db, dbSchema, items, mapping, schematics } from '~/server/db/index';
import { schematicItemCosts } from '../querys/items';
import { researchTree, researchTreeNodes } from '../schema/researchTrees';
import { wikiElement } from '../schema/wiki';

const treeItemUnlocksSubquery = db.$with('treeItemUnlocksSubquery').as(
	db
		.select({
			ipath: sql`trim(both '"' from json_array_elements(${researchTree.treeUnlocks}->0->'items')::text)`.as(
				'ipath'
			),
			needAll: sql<boolean>`${researchTree.treeUnlocks}->0->'needAll'`.as('needAll'),
			tree: sql<string>`${researchTree.path}`.as('tree')
		})
		.from(researchTree)
);

const treeItemUnlocksPrepare = db.$with('treeItemUnlocksPrepare').as(
	db
		.with(treeItemUnlocksSubquery)
		.select({
			tree: treeItemUnlocksSubquery.tree,
			needAll: eq(pgCast(treeItemUnlocksSubquery.needAll, 'text'), 'true').as('needAll'),
			items: pgAggJsonBuildObject({
				name: items.name,
				form: items.form,
				image: items.image,
				short: mapping.shortPath
			}).as('items')
		})
		.from(treeItemUnlocksSubquery)
		.leftJoin(items, eq(treeItemUnlocksSubquery.ipath, items.path))
		.leftJoin(mapping, eq(treeItemUnlocksSubquery.ipath, mapping.elPath))
		.where(isNotNull(items.path))
);

const treeItemUnlocks = db.$with('treeItemUnlocks').as(
	db
		.with(treeItemUnlocksPrepare)
		.select({
			tree: treeItemUnlocksPrepare.tree,
			needAll: pgBoolOr(treeItemUnlocksPrepare.needAll).as('needAll'),
			data: pgJsonAggCoal(treeItemUnlocksPrepare.items).as('data')
		})
		.from(treeItemUnlocksPrepare)
		.groupBy(treeItemUnlocksPrepare.tree)
);

const treeNodesSubquery = db.$with('treeNodesSubquery').as(
	db
		.with(schematicItemCosts)
		.select({
			treePath: researchTreeNodes.treePath,
			data: pgAggJsonBuildObject({
				short_path: mapping.shortPath,
				image: schematics.image,
				name: schematics.name,
				handSlots: schematics.handSlots,
				inventorySlots: schematics.inventorySlots,
				time: schematics.time,
				coordinates: researchTreeNodes.coordinates,
				unhidden_by: researchTreeNodes.unhiddenBy,
				nodes_to_unhide: researchTreeNodes.nodesToUnhide,
				parents: researchTreeNodes.parents,
				costs: schematicItemCosts.costs
			}).as('data')
		})
		.from(researchTreeNodes)
		.leftJoin(schematics, eq(researchTreeNodes.schematicPath, schematics.path))
		.leftJoin(mapping, eq(schematics.path, mapping.elPath))
		.leftJoin(
			schematicItemCosts,
			eq(researchTreeNodes.schematicPath, schematicItemCosts.schematic)
		)
);

const treeNodes = db.$with('treeNodes').as(
	db
		.with(treeNodesSubquery)
		.select({
			treePath: treeNodesSubquery.treePath,
			nodes: pgJsonAggCoal(treeNodesSubquery.data).as('nodes')
		})
		.from(treeNodesSubquery)
		.groupBy(treeNodesSubquery.treePath)
);

const trees = db.$with('trees').as(
	db
		.with(treeNodes, treeItemUnlocks)
		.select({
			shortPath: mapping.shortPath,
			name: researchTree.name,
			description: researchTree.description,
			image: researchTree.image,
			needAll: treeItemUnlocks.needAll,
			treeUnlocks: treeItemUnlocks.data,
			nodes: treeNodes.nodes,
			visits: wikiElement.views
		})
		.from(researchTree)
		.leftJoin(treeNodes, eq(researchTree.path, treeNodes.treePath))
		.leftJoin(mapping, eq(researchTree.path, mapping.elPath))
		.leftJoin(wikiElement, eq(researchTree.path, wikiElement.elPath))
		.leftJoin(treeItemUnlocks, eq(researchTree.path, treeItemUnlocks.tree))
		.where(isNotNull(treeNodes.treePath))
);

export const matResearchTree = createAutomaticMaterilizedView(
	dbSchema.materializedView('mat_research_trees').as(() => {
		return db.with(trees).select().from(trees);
	}),
	{
		cron: '* */5 * * *',
		db,
		concurrently: false
	}
);
