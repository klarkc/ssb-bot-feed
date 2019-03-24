FROM  node:current
WORKDIR /usr/src/ssb-bot-feed
COPY package*.json ./
RUN npm install
COPY . .
CMD ["chmod", "+x", "/usr/src/ssb-bot-feed/index.mjs"]
ENTRYPOINT ["./index.mjs"]