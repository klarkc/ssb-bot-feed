FROM  node:16-alpine
WORKDIR /usr/src/ssb-bot-feed
COPY . .
ENTRYPOINT ["./index.js"]
