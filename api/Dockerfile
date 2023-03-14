FROM public.ecr.aws/docker/library/node:18

WORKDIR /app
COPY package.json yarn.lock ./

WORKDIR api
COPY api/package.json ./
RUN yarn --frozen-lockfile && yarn cache clean

COPY . ./

CMD ["yarn", "start"]
