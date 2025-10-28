# Build this with the repo root as the build context
FROM public.ecr.aws/docker/library/node:20

WORKDIR /app

COPY ./package.json ./yarn.lock ./tsconfig.base.json ./
COPY ./common ./common
COPY ./unpublisher ./unpublisher

RUN yarn install --frozen-lockfile && yarn cache clean

WORKDIR unpublisher

CMD ["yarn", "start"]
