FROM node:20@sha256:cad16010fccab8c3697b5f3577953c2d9a396e9a205673598cd11264ee6d0581

COPY . /dist
WORKDIR /dist

RUN cp .env.example .env
RUN npm install -g pnpm bun
RUN pnpm install
RUN bun run build
RUN rm .env

CMD node .output/server/index.mjs