FROM node:24@sha256:3a09aa6354567619221ef6c45a5051b671f953f0a1924d1f819ffb236e520e6b

COPY . /dist
WORKDIR /dist

RUN cp .env.example .env
RUN npm install -g pnpm bun
RUN pnpm install
RUN bun run build
RUN rm .env

CMD node .output/server/index.mjs