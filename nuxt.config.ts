import { env } from './env.mjs';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
								modules: [
																'@vueuse/nuxt',
																'@pinia/nuxt',
																'@formkit/auto-animate',
																'@pinia-plugin-persistedstate/nuxt',
																'nuxt-typed-router',
																'@nuxt/ui',
																'nuxt-lodash',
																'nuxt-icon',
																'nuxt3-leaflet',
																'@hebilicious/authjs-nuxt',
																'@vue-final-modal/nuxt',
																'@nuxt/image'
								],
								devtools: { enabled: true },
								alias: {
																cookie: 'cookie'
								},
								runtimeConfig: {
																authJs: {
																								secret: process.env.AUTH_SECRET // You can generate one with `openssl rand -base64 32`
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
								}
});
