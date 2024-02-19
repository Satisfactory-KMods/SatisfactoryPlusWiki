import type { SchematicSelect } from '~/server/db';

export function capitalizeFirstLetter(str: string) {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function blueprintPathToShort(path: string) {
	// check first if the blueprintpath is allready a shortpath
	if (!path.includes('_C')) return path;

	let cache = path.split('.').at(-1);
	const modName = path.split('/').at(1);
	if (!cache) return path;

	// remove _C (last to chars)
	cache = cache.slice(0, -2);

	// replace _ with - and return
	return `${modName}-${cache.replace(/_/g, '-')}`.toLowerCase();
}

export function typeToString(
	key: string,
	{ suffix, prefix, single = false }: { suffix?: string; prefix?: string; single?: boolean } = {}
) {
	let str = key;
	switch (key) {
		case 'item':
			str = 'Item';
			break;
		case 'schematic':
			str = 'Schematic';
			break;
		case 'recipe':
			str = 'Recipe';
			break;
		case 'building':
			str = 'Building';
			break;
		case 'researchTree':
			str = 'Research Tree';
			break;
		default:
			break;
	}

	if (!single) {
		str = `${str}s`;
	}

	if (suffix) {
		str += ` ${suffix}`;
	}

	if (prefix) {
		str = `${prefix} ${str}`;
	}

	return str;
}

export function replaceFromRecord(str: string, obj: Record<string, string | number>, bold = true) {
	return str.replace(/{([^{}]*)}/g, (a: any, b: any) => {
		const r = obj[b];
		if (typeof r === 'undefined') return a;
		if (!bold) return String(r);
		return `<b>${String(r)}</b>`;
	});
}

export function getSchematicSuffic({ type, tier }: Pick<SchematicSelect, 'type' | 'tier'>) {
	switch (type) {
		case SFSchematicType.Milestone:
			return `Tier ${tier}`;
		case SFSchematicType.Tutorial:
			return `Tutorial`;
		case SFSchematicType.Alternate:
		case SFSchematicType.HardDrive:
			return `Hard Drive`;
		case SFSchematicType.MAM:
			return `Research Tree`;
		case SFSchematicType.ResourceSink:
			return `Awsome Shop`;
		case SFSchematicType.Story:
			return `Story`;
		default:
			return `Should not be here`;
	}
}

export {
	vElementHover,
	vElementSize,
	vElementVisibility,
	vInfiniteScroll,
	vIntersectionObserver,
	vOnClickOutside,
	vOnKeyStroke,
	vOnLongPress,
	vScroll
} from '@vueuse/components';
