# TODO use node:20 and test
FROM public.ecr.aws/docker/library/node:18

# Install Terraform (for formatting)
ARG TERRAFORM_VERSION=1.4.0
RUN wget -q -O /tmp/terraform.zip https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  unzip -q -o /tmp/terraform.zip -d /usr/local/bin

# Install AWS CLI (v2)
RUN wget -q -O /tmp/awscliv2.zip https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip && \
    unzip -q -o /tmp/awscliv2.zip -d /tmp/awscliv2 && \
    /tmp/awscliv2/aws/install

RUN apt-get update && apt-get install -y zip && apt-get clean

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . ./

CMD ["true"]

