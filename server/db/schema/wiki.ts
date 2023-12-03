import { relations } from 'drizzle-orm';
import { boolean, integer, text, uuid } from 'drizzle-orm/pg-core';
import { dbSchema } from './schema';

// -----------------------------------------------------
// recipes
// -----------------------------------------------------
export const wikiElement = dbSchema.table('wiki_element', {
	id: uuid('id').defaultRandom().primaryKey(),
	elPath: text('el_path').unique().notNull(),
	views: integer('views').default(0).notNull()
});

export const wikiElementRelations = relations(wikiElement, ({ many }) => {
	return {
		wikiEl: many(wikiDesc)
	};
});

// -----------------------------------------------------
// recipes
// -----------------------------------------------------
export const wikiDesc = dbSchema.table('wiki_desc', {
	id: uuid('id').defaultRandom().primaryKey(),
	elId: uuid('el_id').references(() => {
		return wikiElement.id;
	}),
	active: boolean('active').default(false).notNull(),
	text: text('text').notNull(),
	new: boolean('new').default(true).notNull()
});

export const wikiDescRelations = relations(wikiDesc, ({ one }) => {
	return {
		wikiEl: one(wikiElement, {
			fields: [wikiDesc.elId],
			references: [wikiElement.id]
		})
	};
});
