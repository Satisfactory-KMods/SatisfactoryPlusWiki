import { eq, not } from 'drizzle-orm';
import { db, mapping, researchTree } from '~/server/db/index';
import { matResearchTree } from '../db/mat';

export function getResearchTrees() {
	return db
		.select({
			name: researchTree.name,
			image: researchTree.image,
			shortPath: mapping.shortPath
		})
		.from(researchTree)
		.leftJoin(mapping, eq(researchTree.path, mapping.elPath))
		.where(not(eq(mapping.shortPath, 'game-bpd-researchtree-harddrive')));
}

export function getResearchTreeData(path: string) {
	return db
		.select()
		.from(matResearchTree)
		.where(eq(matResearchTree.shortPath, path))
		.limit(1)
		.then((res) => {
			if (!res[0]) {
				throw new Error('Tree not found');
			}
			return res[0];
		});
}

export function inlineCatchNull<T extends (...args: any[]) => any>(fn: T): ReturnType<T> | null {
	try {
		return fn();
	} catch (e) {
		return null;
	}
}

export function inlineCatch<T extends (...args: any[]) => any>(
	fn: T,
	catchResult: ReturnType<T>
): ReturnType<T> {
	try {
		return fn();
	} catch (e) {
		return catchResult;
	}
}
