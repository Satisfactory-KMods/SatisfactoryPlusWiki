export function capitalizeFirstLetter(str: string) {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function blueprintPathToShort(path: string) {
	let cache = path.split('.').at(-1);
	const modName = path.split('/').at(1);
	if (!cache) return path;

	// remove _C (last to chars)
	cache = cache.slice(0, -2);

	// replace _ with - and return
	return `${modName}-${cache.replace(/_/g, '-')}`.toLowerCase();
}
