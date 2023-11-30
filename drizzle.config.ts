import { type Config } from 'drizzle-kit';

import { dbCredentials } from './env.mjs';

export default {
	schema: './server/db/schema',
	driver: 'pg',
	out: './server/db/migrations',
	dbCredentials,
	tablesFilter: ['asa-web-servermanager_*']
} satisfies Config;
