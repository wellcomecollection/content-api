# Build this with the repo root as the build context
FROM public.ecr.aws/docker/library/node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS base

WORKDIR /app

COPY ./package.json ./yarn.lock ./tsconfig.base.json ./
COPY ./common/package.json ./common/
COPY ./api/package.json ./api/

# CI runs `yarn test` in this stage; it is never published.
FROM base AS test

RUN yarn install --frozen-lockfile && yarn cache clean

COPY ./common ./common
COPY ./api ./api

WORKDIR /app/api
CMD ["yarn", "test"]

# Published image: production dependencies only, so test and lint tooling don't ship.
FROM base AS runtime

RUN yarn install --frozen-lockfile --production && yarn cache clean

# The app runs under yarn; the base image's bundled npm only adds scanner findings.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# Paths are listed so a local node_modules never lands in the image.
COPY ./common/tsconfig.json ./common/
COPY ./common/data ./common/data
COPY ./common/services ./common/services
COPY ./common/types ./common/types
COPY ./api/config.ts ./api/server.ts ./api/tsconfig.json ./api/
COPY ./api/src ./api/src

WORKDIR /app/api
CMD ["yarn", "start"]
