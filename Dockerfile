FROM  node:16-alpine
WORKDIR /usr/src/ssb-bot-feed
COPY . .
RUN npm install --no-save
ENTRYPOINT ["./index.js"]
