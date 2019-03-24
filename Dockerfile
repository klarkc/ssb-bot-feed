FROM  node:current

RUN npm i -g ssb-bot-feed
ARG ARGS
CMD ["ssb-bot-feed", $ARGS]