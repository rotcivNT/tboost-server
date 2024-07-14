FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

RUN corepack enable yarn

RUN corepack use yarn@*

RUN yarn install

COPY --chown=node:node . .

RUN yarn build

FROM node:20-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ENV YARN_VERSION=4.3.0

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

COPY . .

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

CMD ["node", "dist/apps/upload-service/main"]