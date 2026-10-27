# Build this with the repo root as the build context
FROM public.ecr.aws/docker/library/node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205

WORKDIR /app

COPY ./package.json ./yarn.lock ./tsconfig.base.json ./
COPY ./common ./common
COPY ./api ./api

WORKDIR api
RUN yarn install --frozen-lockfile && yarn cache clean

# The app runs under yarn; the base image's bundled npm only adds scanner findings.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

CMD ["yarn", "start"]
