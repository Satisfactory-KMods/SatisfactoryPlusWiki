export enum SFDataType {
	buildable = 'buildable',
	recipe = 'recipe',
	cleaner = 'cleaner',
	schematic = 'schematic',
	informations = 'informations',
	itemDescriptor = 'itemDescriptor',
	food = 'food',
	resourceMap = 'resourceMap',
	researchTree = 'researchTree'
}

export interface SFDataBase {}

export interface SFSchematicData extends SFDataBase {}

export interface SFBuildableData extends SFDataBase {}

export interface SFRecipeData extends SFDataBase {}

export interface SFCleanerData extends SFDataBase {}

export interface SFInformationsData extends SFDataBase {}

export interface SFItemData extends SFDataBase {}

export interface SFFoodData extends SFDataBase {}

export interface SFResourceMapData extends SFDataBase {}

export interface SFTreeData extends SFDataBase {}
