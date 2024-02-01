import { NuxtAuthHandler } from '#auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import DiscordProvider from 'next-auth/providers/discord';
import { db, dbSchema } from '~/server/db';

const runtimeConfig = useRuntimeConfig();

/**
 * https://github.com/nuxt/nuxt/issues/20576#issuecomment-1712859008
 * we need to use .default because of a random issue here
 * also ignore the TS error because it's not actually an error and it works fine
 */
export default NuxtAuthHandler({
	secret: runtimeConfig.authJs.secret,
	providers: [
		// @ts-ignore
		DiscordProvider.default({
			clientId: runtimeConfig.discord.clientId,
			clientSecret: runtimeConfig.discord.clientSecret
		})
	],
	session: {
		strategy: 'database',
		updateAge: 60 * 60 * 2
	},
	// @ts-ignore
	adapter: DrizzleAdapter(db, dbSchema.table as any)
});
