FROM node:18

COPY . /dist
WORKDIR /dist

RUN cp .env.example .env
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build
RUN rm .env

CMD node .output/server/index.mjs