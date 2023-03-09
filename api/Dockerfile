FROM public.ecr.aws/docker/library/node:18

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . ./

CMD ["yarn", "start"]
