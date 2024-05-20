# Use Node Alpine as the base image for development
FROM node:20 as development

WORKDIR /usr/src/app

COPY package.json package-lock.json yarn.lock ./
RUN yarn install && yarn add @nestjs/cli

COPY . .

RUN yarn run build

EXPOSE 3001
CMD [ "yarn", "start:dev" ]