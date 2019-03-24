# ssb-bot-feed
[![Travis](https://img.shields.io/travis/klarkc/ssb-bot-feed/master.svg)](https://travis-ci.org/klarkc/ssb-bot-feed/branches)

Scuttlebutt bot that read RSS feeds and post updates automatically

## Usage

Download and run [ssb-server](https://github.com/ssbc/ssb-server)

`npm install -g ssb-bot-feed`

`ssb-bot-feed http://www.nintendolife.com/feeds/news`

By default It connects on `localhost:8008` ([ssb-server](https://github.com/ssbc/ssb-server)) and uses `~/.ssb` settings.

## Docker

The docker image assumes that you have a [ssb-server](https://github.com/ssbc/ssb-server) listening on localhost:8008

`~/.ssb` is the path to `.ssb` folder where bot will load secrets and manifest

```bash
docker run -d --name ssb-bot-feed \
   --network="host" \
   --restart=always \
   -v ~/.ssb:/root/.ssb \
   klarkc/ssb-bot-feed http://www.nintendolife.com/feeds/news
```