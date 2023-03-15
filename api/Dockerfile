FROM public.ecr.aws/docker/library/node:18

WORKDIR /app
COPY package.json yarn.lock ./

RUN pwd
RUN find . -type f

WORKDIR /api
COPY api/package.json ./

RUN pwd
RUN find . -type f

RUN yarn --frozen-lockfile && yarn cache clean

COPY . ./

CMD ["yarn", "start"]
