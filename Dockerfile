FROM node:20@sha256:c85db7ec0c2cbedc73f417b890e0b08ecdf5316f858033316d6566ee11715158

COPY . /dist
WORKDIR /dist

RUN cp .env.example .env
RUN npm install -g pnpm bun
RUN pnpm install
RUN bun run build
RUN rm .env

CMD node .output/server/index.mjs