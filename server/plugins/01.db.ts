import { startMigrate } from '~/server/db';

export default defineNitroPlugin(async () => {
	await startMigrate();
});
