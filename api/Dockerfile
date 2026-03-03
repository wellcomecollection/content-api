# Build this with the repo root as the build context
FROM public.ecr.aws/docker/library/node:24.13.0

WORKDIR /app

COPY ./package.json ./yarn.lock ./tsconfig.base.json ./
COPY ./common ./common
COPY ./api ./api

WORKDIR api
RUN yarn install --frozen-lockfile && yarn cache clean

CMD ["yarn", "start"]
