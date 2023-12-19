export enum SFDataType {
	buildable = 'buildable',
	recipe = 'recipe',
	cleaner = 'cleaner',
	schematic = 'schematic',
	informations = 'informations',
	itemDescriptor = 'itemDescriptor',
	food = 'food',
	resourceMap = 'resourceMap',
	researchTree = 'researchTree',
	map = 'map'
}

export enum SFSchematicType {
	Custom = '0',
	Cheat = '1',
	Tutorial = '2',
	Milestone = '3',
	Alternate = '4',
	Story = '5',
	MAM = '6',
	ResourceSink = '7',
	HardDrive = '8',
	Prototype = '9'
}

export enum SFEggDateTime {
	None,
	Any,
	Day,
	Night
}

export enum SFItemForm {
	INVALID = '0',
	SOLID = '1',
	LIQUID = '2',
	GAS = '3',
	HEAT = '4',
	LAST_ENUM = '5'
}

export enum SFResourceNodePurity {
	impure,
	normal,
	pure,
	loot = 86,
	pickup = 48,
	wellCore = 255
}

export enum SFResourceNodeType {
	deposits = 'deposits',
	resourceWells = 'resourceWells',
	geysers = 'geysers',
	lootChests = 'lootChests',
	pickup = 'pickup',
	resourceNodes = 'resourceNodes'
}

export enum SFDescType {
	BUILDING = '0',
	ITEM = '1',
	EQUIP = '2',
	CONSUME = '3',
	VEHICLE = '4',
	RESOURCE = '5'
}

export type SFTreeUnlockElement = {
	items: string[];
	needAll: boolean;
};

export type NodeCoords = { X: number; Y: number };

export type SFDataItemTypeNormal = {
	type: 'normal';
};

export type FluidInfoItem = {
	path: string;
	normalFluidCountPerSecond: number;
	productionTimeMulti: number;
};

export type SFDataItemTypeMiner = {
	type: 'miner';
	drillTier: 1;
	scannerTier: 1;
	modulInformation: [];
	neededModules: string[];
	preventModules: string[];
	fluidInfos: FluidInfoItem[];
};

export type SFDataItemTypeEgg = {
	type: 'egg';
	minHumidity: number;
	maxHumidity: number;
	minHeat: number;
	maxHeat: number;
	dayTime: SFEggDateTime;
	incubatorTier: number;
	fluidConsume: number;
	fluidConsumeTime: number;
	fluid: string;
	hatchingTime: number;
	power: number;
	realDescription: string;
	realName: string;
	hiddenDescription: string;
	hiddenName: string;
	possibleSlugs: string[];
	tierBasedChance: number[];
};

export type SFDataItemTypeSlug = {
	type: 'slug';
	minHumidity: number;
	maxHumidity: number;
	minHeat: number;
	maxHeat: number;
	dayTime: SFEggDateTime;
	foodTier: number;
	foodConsumeTime: number;
	foodConsumePerSlug: number;
	dieTime: number;
	breedingTime: number;
	productionCountPerSlug: number;
	egg: string;
	food: string;
	slugRarity: number;
	realDescription: string;
	realName: string;
	hiddenDescription: string;
	hiddenName: string;
	comfortableWith: string[];
};

export type SFDataItemType = SFDataItemTypeNormal | SFDataItemTypeMiner | SFDataItemTypeSlug | SFDataItemTypeEgg;

export type SFNodeCoordsItemAmount = {
	item: string;
	amount: number;
};

export type SFNodeCoordsBase = {
	x: number;
	y: number;
	z: number;
	purity: SFResourceNodePurity;
};

export type SFNodeCoords = SFNodeCoordsBase & {
	satelites: SFNodeCoordsBase[];
	itemAmounts: SFNodeCoordsItemAmount[];
};
