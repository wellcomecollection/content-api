# Build this with the repo root as the build context
FROM public.ecr.aws/docker/library/node:18

WORKDIR /app

COPY ./package.json ./yarn.lock ./tsconfig.base.json ./
COPY ./common ./common
COPY ./pipeline ./pipeline

RUN yarn install --frozen-lockfile && yarn cache clean

WORKDIR pipeline

CMD ["yarn", "start"]
