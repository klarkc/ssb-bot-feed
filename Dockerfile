FROM  node:lts
WORKDIR /usr/src/ssb-bot-feed
COPY . .
ENTRYPOINT ["./index.js"]
