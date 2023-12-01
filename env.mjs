import { z } from 'zod';

export const env = {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development').parse(process.env.NODE_ENV),
    AUTH_SECRET: z.string().parse(process.env.AUTH_SECRET),
    AUTH_DEPLOY_URL: z.string().parse(process.env.AUTH_DEPLOY_URL),
    AUTH_DISCORD_CLIENT_ID: z.string().parse(process.env.AUTH_DISCORD_CLIENT_ID),
    AUTH_DISCORD_CLIENT_SECRET: z.string().parse(process.env.AUTH_DISCORD_CLIENT_SECRET),
    POSTGRES_HOST: z.string().parse(process.env.POSTGRES_HOST),
    POSTGRES_DB: z.string().parse(process.env.POSTGRES_DB),
    POSTGRES_PASSWORD: z.string().parse(process.env.POSTGRES_PASSWORD),
    POSTGRES_USER: z.string().parse(process.env.POSTGRES_USER),
    POSTGRES_PORT: z.number().min(0).max(65535).parse(parseInt(process.env.POSTGRES_PORT ?? '5432')),
}

export const dbCredentials = {
    host: env.POSTGRES_HOST,
    user: env.POSTGRES_USER,
    database: env.POSTGRES_DB,
    password: env.POSTGRES_PASSWORD,
    port: env.POSTGRES_PORT
}