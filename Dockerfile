FROM  node:16-alpine
WORKDIR /usr/src/ssb-bot-feed
COPY . .
RUN apk add --no-cache python3
RUN npm install --no-save
ENTRYPOINT ["./index.js"]
