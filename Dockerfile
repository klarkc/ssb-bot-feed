FROM  node:current
WORKDIR /usr/src/ssb-bot-feed
COPY package*.json ./
RUN npm install
COPY . .
CMD ["chmod", "+x", "./index.mjs"]
ENTRYPOINT ["./index.mjs"]
