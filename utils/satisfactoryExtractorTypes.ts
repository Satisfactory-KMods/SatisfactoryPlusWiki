import type { getRecipeWithProducedIn } from '~/server/db/handler/bind/index';
import { type SchematicSelect } from '~/server/db/index';
import type { BuildableSelect } from './../server/db/schema/buildables';
import type { ItemSelect } from './../server/db/schema/items';
import type { InferReturnArray } from './typeUtils';

export enum SFDataType {
	buildable = 'buildable',
	recipe = 'recipe',
	cleaner = 'cleaner',
	schematic = 'schematic',
	informations = 'informations',
	informationBuildings = 'buildings',
	itemDescriptor = 'itemDescriptor',
	food = 'food',
	resourceMap = 'resourceMap',
	researchTree = 'researchTree',
	map = 'map'
}

export enum WikiInformationType {
	Recipe = 0,
	Boiler = 1,
	Turbine = 2,
	Heater = 3,
	Cooler = 4,
	Cleaner = 5,
	Extractor = 6,
	ExtractorWasteProducer = 7,
	ExtractorConsumer = 8,
	AirCollector = 9,
	SeedExtractor = 10,
	SlugHatcher = 11,
	SlugTerrarium = 12
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

export function SFItemFormToString(form: SFItemForm): string {
	switch (form) {
		case SFItemForm.SOLID:
			return 'Solid';
		case SFItemForm.LIQUID:
			return 'Liquid';
		case SFItemForm.GAS:
			return 'Gas';
		case SFItemForm.HEAT:
			return 'Heat';
		default:
			return 'Invalid';
	}
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

export type SFDataItemBase = {};

export type SFDataItemTypeNormal = {
	type: 'normal';
};

export type FluidInfoItem = {
	path: ItemSelect;
	normalFluidCountPerSecond: number;
	productionTimeMulti: number;
};

export type ModulInfo = {
	path: BuildableSelect;
	productionItem: ItemSelect;
	trashItem: ItemSelect;
};

export type SFDataItemTypeMiner = {
	type: 'miner';
	drillTier: 1;
	scannerTier: 1;
	modulInformation: ModulInfo[];
	neededModules: BuildableSelect[];
	preventModules: BuildableSelect[];
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
	fluid: ItemSelect | null;
	hatchingTime: number;
	power: number;
	realDescription: string;
	realName: string;
	hiddenDescription: string;
	hiddenName: string;
	possibleSlugs: ItemSelect[];
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
	egg: ItemSelect;
	food: ItemSelect;
	slugRarity: number;
	realDescription: string;
	realName: string;
	hiddenDescription: string;
	hiddenName: string;
	comfortableWith: ItemSelect[];
};

export type SFDataItemType = (
	| SFDataItemTypeNormal
	| SFDataItemTypeMiner
	| SFDataItemTypeSlug
	| SFDataItemTypeEgg
) &
	SFDataItemBase;

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

export type SFInfoItemConsumeAmount = {
	item: ItemSelect;
	amount: number;
	time: number;
};

export type SFInfoBuildableProduceAmount = {
	item: BuildableSelect;
	amount: number;
	time: number;
};

export type SFInformationRow = SFNodeCoordsBase & {
	isRecipe: boolean;
	type: WikiInformationType;
	buildingRecipe: boolean;
	isAlternate: boolean;
	productionElement:
		| { type: 'recipe'; data: InferReturnArray<typeof getRecipeWithProducedIn> }
		| { type: 'buildable'; data: BuildableSelect }
		| null;
	wasteProducer: BuildableSelect | null;
	itemAmounts: SFNodeCoordsItemAmount[];
	output: SFInfoItemConsumeAmount[];
	schematics: SchematicSelect[];
} & (
		| {
				buildingRecipe: true;
				input: SFInfoBuildableProduceAmount[];
		  }
		| {
				buildingRecipe: false;
				input: SFInfoItemConsumeAmount[];
		  }
	);

export function slugDayTimeToString(dayTime: SFEggDateTime): string {
	switch (dayTime) {
		case SFEggDateTime.Any:
			return 'Any Time';
		case SFEggDateTime.Day:
			return 'Day Only (can modify with DayTime Modul)';
		case SFEggDateTime.Night:
			return 'Night Only (can modify with DayTime Modul)';
		default:
			return 'None';
	}
}

export function uePercentToPercent(value: number): number {
	value *= 100;
	return Math.round(value * 100) / 100;
}

export function roundToDec(value: number, len = 2): number {
	const factor = Math.pow(10, len);
	return Math.round(value * factor) / factor;
}
