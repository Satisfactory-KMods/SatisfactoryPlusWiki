import { log } from '~/utils/logger';
import { bind } from './bind';
import { map } from './map';
import { prepare } from './prepare';

export async function startReadingData() {
	log('info', `prepare data...`);
	await prepare();
	log('info', `bind data...`);
	await bind();
	log('info', `prepare map...`);
	await map();
	log('info', `Finished data prepare...`);
}
