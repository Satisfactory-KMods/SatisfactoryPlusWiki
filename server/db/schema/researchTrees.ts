import { colJson } from '@kmods/drizzle-orm-utils';
import { relations } from 'drizzle-orm';
import { text, unique, uuid } from 'drizzle-orm/pg-core';
import type {
	NodeCoords,
	SFDataType,
	SFTreeUnlockElement
} from '~/utils/satisfactoryExtractorTypes';
import { dataTypeEnum, dbSchema } from './schema';
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
	treeUnlocks: colJson('tree_unlocks').$type<SFTreeUnlockElement[]>().notNull(),
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
		coordinates: colJson('coordinates').$type<NodeCoords>().notNull(),
		unhiddenBy: colJson('unhidden_by').$type<NodeCoords[]>().default([]).notNull(),
		nodesToUnhide: colJson('nodes_to_unhide').$type<NodeCoords[]>().default([]).notNull(),
		parents: colJson('parents').$type<NodeCoords[]>().default([]).notNull()
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
