# ssb-bot-feed

Scuttlebutt bot that read RSS feeds and post updates automatically

## Usage

Download and run [ssb-server](https://github.com/ssbc/ssb-server)

`npm install -g ssb-bot-feed`

Syntax:

`ssb-bot-feed [feed1] [feed2] [feedN]`

Example:

`ssb-bot-feed http://www.nintendolife.com/feeds/news`

By default It connects on `localhost:8008` ([ssb-server](https://github.com/ssbc/ssb-server)) and uses `~/.ssb` settings.

Full documentation: `ssb-bot-feed --help`.

## Docker

⚠️ Docker image is no longer updated ([this is the why](https://www.reddit.com/r/docker/comments/otyet9/automated_builds_are_paid_now/)), there is not so much we can do right now.

The docker image assumes that you have a [ssb-server](https://github.com/ssbc/ssb-server) listening on localhost:8008

`~/.ssb` is the path to `.ssb` folder where bot will load secrets and manifest

```bash
docker run -d --name ssb-bot-feed \
   --network="host" \
   --restart=always \
   -v ~/.ssb:/root/.ssb \
   klarkc/ssb-bot-feed -h localhost -p 8008 http://www.nintendolife.com/feeds/news
```

## Roadmap

- [ ] `IN PROGRESS` rewrite the code to TypeScript to improve DX
- [ ] Add runtime admin commands through SSB protocol

## Alternatives

- [marine-master/ssb-bot-feed](https://github.com/marine-master/ssb-bot-feed) more robust fork with yaml configuration and more features
