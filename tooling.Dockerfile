FROM public.ecr.aws/docker/library/node:18

# Install Terraform (for formatting)
ARG TERRAFORM_VERSION=1.4.0
RUN wget -q -O /tmp/terraform.zip https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  unzip -q -o /tmp/terraform.zip -d /usr/local/bin

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . ./

CMD ["true"]

