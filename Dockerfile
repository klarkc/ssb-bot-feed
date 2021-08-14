FROM  node:16-alpine
WORKDIR /usr/src/ssb-bot-feed
COPY . .
ENV NODE_ENV production
RUN npm install --no-save --no-optional
ENTRYPOINT ["./index.js"]
