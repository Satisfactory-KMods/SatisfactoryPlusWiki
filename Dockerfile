FROM node:18

COPY . /dist
WORKDIR /dist

RUN cp .env.example .env
RUN npm install -g pnpm bun
RUN pnpm install
RUN bun run build
RUN rm .env

CMD node .output/server/index.mjs