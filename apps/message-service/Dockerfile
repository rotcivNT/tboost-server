FROM node:20-alpine as development

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

RUN corepack enable

RUN yarn set version 4.3.1

RUN yarn install

COPY --chown=node:node . .

RUN yarn build

FROM node:20-alpine as production

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN corepack enable
RUN yarn set version 4.3.1

COPY . .

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules

CMD ["node", "dist/apps/message-service/main"]