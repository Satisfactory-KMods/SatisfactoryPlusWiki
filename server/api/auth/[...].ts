import { NuxtAuthHandler } from '#auth';
import DiscordProvider from '@auth/core/providers/discord';
import type { AuthConfig } from '@auth/core/types';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '~/server/db';

const runtimeConfig = useRuntimeConfig();

export const authOptions: AuthConfig = {
	secret: runtimeConfig.authJs.secret,
	providers: [
		DiscordProvider({
			clientId: runtimeConfig.discord.clientId,
			clientSecret: runtimeConfig.discord.clientSecret
		})
	],
	session: {
		strategy: 'database',
		updateAge: 60 * 60 * 2
	},
	adapter: DrizzleAdapter(db)
};

export default NuxtAuthHandler(authOptions, runtimeConfig);
