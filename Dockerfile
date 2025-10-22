FROM node:22@sha256:23c24e85395992be118734a39903e08c8f7d1abc73978c46b6bda90060091a49

COPY . /dist
WORKDIR /dist

RUN cp .env.example .env
RUN npm install -g pnpm bun
RUN pnpm install
RUN bun run build
RUN rm .env

CMD node .output/server/index.mjs