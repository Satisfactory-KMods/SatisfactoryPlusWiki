FROM node:20@sha256:bd3086f61c05f8925ed2026bee608a40ad9f8a5d28b6e593342237469ee5b621

COPY . /dist
WORKDIR /dist

RUN cp .env.example .env
RUN npm install -g pnpm bun
RUN pnpm install
RUN bun run build
RUN rm .env

CMD node .output/server/index.mjs