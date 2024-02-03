import { relations } from 'drizzle-orm';
import { json, text, unique, uuid } from 'drizzle-orm/pg-core';
import type { NodeCoords, SFDataType, SFTreeUnlockElement } from '~/utils/satisfactoryExtractorTypes';
import { dataTypeEnum, dbSchema } from './schema';
import { safeJson } from '../../utils/db';
import { schematics } from './schematics';
import { wikiElement } from './wiki';

// -----------------------------------------------------
// researchTree
// -----------------------------------------------------
export const researchTree = dbSchema.table('research_tree', {
	id: uuid('id').defaultRandom().primaryKey(),
	path: text('path').notNull().unique(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	image: text('image').notNull(),
	treeUnlocks: safeJson<SFTreeUnlockElement[]>()('tree_unlocks').notNull(),
	dataType: dataTypeEnum('data_type').$type<SFDataType>().notNull()
});

export type ResearchTreeInsert = typeof researchTree.$inferInsert;
export type ResearchTreeSelect = typeof researchTree.$inferSelect;

export const researchTreeRelations = relations(researchTree, ({ many, one }) => {
	return {
		schematics: many(schematics),
		nodes: many(researchTreeNodes),
		wikiEl: one(wikiElement, {
			fields: [researchTree.id],
			references: [wikiElement.elPath]
		})
	};
});

// -----------------------------------------------------
// researchTree Nodes
// -----------------------------------------------------

export const researchTreeNodes = dbSchema.table(
	'research_tree_nodes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		treePath: text('tree_path')
			.notNull()
			.references(
				() => {
					return researchTree.path;
				},
				{
					onDelete: 'cascade'
				}
			),
		schematicPath: text('schematic_path')
			.notNull()
			.references(
				() => {
					return schematics.path;
				},
				{
					onDelete: 'cascade'
				}
			),
		coordinates: safeJson<NodeCoords>()('coordinates').notNull(),
		unhiddenBy: safeJson<NodeCoords[]>()('unhidden_by').default([]).notNull(),
		nodesToUnhide: safeJson<NodeCoords[]>()('nodes_to_unhide').default([]).notNull(),
		parents: safeJson<NodeCoords[]>()('parents').default([]).notNull()
	},
	(t) => {
		return {
			unq: unique().on(t.treePath, t.schematicPath)
		};
	}
);

export const researchTreeSchematicsNodes = relations(researchTreeNodes, ({ one }) => {
	return {
		tree: one(researchTree, {
			fields: [researchTreeNodes.treePath],
			references: [researchTree.path]
		}),
		schematic: one(schematics, {
			fields: [researchTreeNodes.schematicPath],
			references: [schematics.path]
		})
	};
});

// -----------------------------------------------------
// researchTree schematics
// -----------------------------------------------------

export const researchTreeSchematics = dbSchema.table(
	'research_tree_schematics',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		treePath: text('tree_path')
			.notNull()
			.references(
				() => {
					return researchTree.path;
				},
				{
					onDelete: 'cascade'
				}
			),
		schematicPath: text('schematic_path')
			.notNull()
			.references(
				() => {
					return schematics.path;
				},
				{
					onDelete: 'cascade'
				}
			)
	},
	(t) => {
		return {
			unq: unique().on(t.treePath, t.schematicPath)
		};
	}
);

export const researchTreeSchematicsRelations = relations(researchTreeSchematics, ({ one }) => {
	return {
		tree: one(researchTree, {
			fields: [researchTreeSchematics.treePath],
			references: [researchTree.path]
		}),
		schematic: one(schematics, {
			fields: [researchTreeSchematics.schematicPath],
			references: [schematics.path]
		})
	};
});
