FROM  node:16-alpine
WORKDIR /usr/src/ssb-bot-feed
RUN apk add --no-cache python3 build-base libtool autoconf automake
COPY . .
ENV NODE_ENV production
RUN npm install -g npm@latest
RUN npm install --no-save
ENTRYPOINT ["./index.js"]
