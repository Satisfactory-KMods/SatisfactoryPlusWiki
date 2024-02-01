import { env } from './env.mjs';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@sidebase/nuxt-auth',
		'@vueuse/nuxt',
		'@pinia/nuxt',
		'@pinia-plugin-persistedstate/nuxt',
		'nuxt-typed-router',
		'@nuxt/ui',
		'nuxt-icon',
		'nuxt3-leaflet',
		'@nuxt/image'
	],
	ssr: true,
	css: ['leaflet/dist/leaflet.css', 'vue-final-modal/style.css'],
	ui: {
		icons: ['heroicons', 'mdi'],
		safelistColors: ['sky', 'cool', 'warm', 'red', 'green', 'blue', 'purple', 'pink', 'yellow', 'orange', 'gray', 'white', 'black'],
		global: true
	},
	routeRules: {
		'/map': { ssr: false }
	},
	pinia: {
		storesDirs: ['./stores/**']
	},
	colorMode: {
		preference: 'dark'
	},
	image: {
		domains: ['discord.com']
	},
	devtools: { enabled: true },
	alias: {
		cookie: 'cookie'
	},
	runtimeConfig: {
		authJs: {
			secret: process.env.AUTH_SECRET
		},
		discord: {
			clientId: env.AUTH_DISCORD_CLIENT_ID,
			clientSecret: env.AUTH_DISCORD_CLIENT_SECRET
		},
		public: {
			authJs: {
				baseUrl: env.AUTH_DEPLOY_URL,
				verifyClientOnEveryRequest: true
			}
		}
	},
	nitro: {
		hooks: {
			'dev:reload': () => {
				return require('sharp');
			}
		}
	}
});
