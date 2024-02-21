import { scheduleJob } from 'node-schedule';
import { log } from '~/utils/logger';

export const readingMap = new Map<string, Set<string>>();

export function hasReaded(path: string, user: string) {
	const set = readingMap.get(path);
	if (!set) return false;
	return set.has(user);
}

export function setReaded(path: string, user: string) {
	const set = readingMap.get(path);
	if (!set) {
		readingMap.set(path, new Set([user]));
		return;
	}
	set.add(user);
}

export default defineNitroPlugin(() => {
	log('info', `Install schedules...`);
	scheduleJob('0 0 * * *', () => {
		readingMap.clear();
	});
});
