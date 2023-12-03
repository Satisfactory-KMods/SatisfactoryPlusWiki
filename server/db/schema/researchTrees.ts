import { relations } from 'drizzle-orm';
import { index, json, text, unique, uuid } from 'drizzle-orm/pg-core';
import type { NodeCoords, SFDataType, SFTreeUnlockElement } from '~/utils/satisfactoryExtractorTypes';
import { dataTypeEnum, dbSchema } from './schema';
import { schematics } from './schematics';

// -----------------------------------------------------
// researchTree
// -----------------------------------------------------
export const researchTree = dbSchema.table(
	'research_tree',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		path: text('path').notNull().unique(),
		name: text('name').notNull(),
		description: text('description').notNull(),
		image: text('image').notNull(),
		treeUnlocks: json('tree_unlocks').$type<SFTreeUnlockElement[]>().notNull(),
		dataType: dataTypeEnum('data_type').$type<SFDataType>().notNull()
	},
	(t) => {
		return {
			pathIdx: index('name_idx').on(t.path)
		};
	}
);

export type ResearchTreeInsert = typeof researchTree.$inferInsert;
export type ResearchTreeSelect = typeof researchTree.$inferSelect;

export const researchTreeRelations = relations(researchTree, ({ many }) => {
	return {
		schematics: many(schematics),
		nodes: many(researchTreeNodes)
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
		coordinates: json('coordinates').$type<NodeCoords>().notNull(),
		unhiddenBy: json('unhidden_by').default([]).$type<NodeCoords[]>().notNull(),
		nodesToUnhide: json('nodes_to_unhide').default([]).$type<NodeCoords[]>().notNull(),
		parents: json('parents').default([]).$type<NodeCoords[]>().notNull()
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
