import { log } from '~/utils/logger';
import { bind } from './bind';
import { map } from './map';
import { prepare } from './prepare';

export async function startReadingData() {
	log('info', `Reading data...`);
	await prepare();
	await bind();
	await map();
	log('info', `Finished data...`);
}
