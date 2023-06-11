FROM redis:alpine3.17

# RUN whereis redis.conf
RUN find /"redis.conf"

# COPY redis.conf /usr/local/etc/redis/redis.conf
COPY /home/user/config/redis.conf /usr/local/etc/redis/redis.conf


CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]

FROM node:16.19-alpine AS development

WORKDIR /usr/src/app

RUN ls

COPY package*.json ./

# RUN npm install glob rimraf

RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:16.19-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}


ENV DATABASE_TYPE=DATABASE_TYPE
ENV DATABASE_HOST=DATABASE_HOST
ENV DATABASE_PORT=5432
ENV DATABASE_USERNAME=DATABASE_USERNAME
ENV DATABASE_PASSWORD=DATABASE_PASSWORD
ENV DATABASE_NAME=DATABASE_NAME

ENV DATABASE_CONNECTION_URL=DATABASE_CONNECTION_URL
ENV JWT_SECRET=JWT_SECRET
ENV JWT_EXPIRE_IN=JWT_EXPIRE_IN
ENV TERMII_API_kEY=TERMII_API_kEY
ENV TERMII_SMS_FROM=TERMII_SMS_FROM
ENV REDIS_HOST=REDIS_HOST
ENV REDIS_PORT=REDIS_PORT
ENV REDIS_USERNAME=REDIS_USERNAME
ENV REDIS_PASSWORD=REDIS_PASSWORD
ENV PAYSTACK_SECRET_KEY=PAYSTACK_SECRET_KEY
ENV AZURE_STORAGE_CONNECTION_STRING=AZURE_STORAGE_CONNECTION_STRING

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]