# Build this with the repo root as the build context
FROM public.ecr.aws/docker/library/node:18

WORKDIR /app

COPY ./package.json ./yarn.lock ./
COPY ./api ./api

WORKDIR api
RUN yarn install --frozen-lockfile && yarn cache clean

CMD ["yarn", "start"]
