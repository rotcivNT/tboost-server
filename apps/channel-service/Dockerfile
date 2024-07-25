FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

ENV YARN_VERSION=4.3.1

RUN corepack enable

RUN yarn set version 4.3.1

RUN yarn workspaces focus --production

COPY --chown=node:node . .

RUN yarn build

FROM node:20-alpine as development

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV YARN_VERSION=4.3.1

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

RUN corepack enable
RUN yarn set version 4.3.1

COPY . .

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

CMD ["yarn", "run", "start:dev"]