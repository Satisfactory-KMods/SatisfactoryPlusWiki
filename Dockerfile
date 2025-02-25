FROM node:20@sha256:bcf90f85634194bc51e92f8add1221c7fdeeff94b7f1ff360aeaa7498086d641

COPY . /dist
WORKDIR /dist

RUN cp .env.example .env
RUN npm install -g pnpm bun
RUN pnpm install
RUN bun run build
RUN rm .env

CMD node .output/server/index.mjs