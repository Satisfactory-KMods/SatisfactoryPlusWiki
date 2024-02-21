import { pgEnum, pgSchema } from 'drizzle-orm/pg-core';

export const dbSchema = pgSchema('sfp-wiki');

export const resourceNodeType = pgEnum('resource_node_type', ['deposits', 'resourceWells', 'geysers', 'lootChests', 'pickup', 'resourceNodes']);
export const schematicType = pgEnum('schematic_type', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
export const descriptorType = pgEnum('desc_type', ['0', '1', '2', '3', '4', '5']);
export const itemFormEnum = pgEnum('item_form', ['0', '1', '2', '3', '4', '5']);
export const dataTypeEnum = pgEnum('data_type', [
	'buildable',
	'recipe',
	'cleaner',
	'schematic',
	'informations',
	'itemDescriptor',
	'food',
	'resourceMap',
	'researchTree'
]);
