FROM node:20@sha256:196a5fcd13db4362fb9c0ec5391db36ec954c65d6b0d0e5d37f59c7dc9920690

COPY . /dist
WORKDIR /dist

RUN cp .env.example .env
RUN npm install -g pnpm bun
RUN pnpm install
RUN bun run build
RUN rm .env

CMD node .output/server/index.mjs