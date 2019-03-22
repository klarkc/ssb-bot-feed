import RssFeedEmitter from 'rss-feed-emitter'

const feeder = new RssFeedEmitter();

export function createBot(url, {onPost, onError}) {
    feeder.add({ url })
    feeder.on('new-item', onPost)
    feeder.on('error', onError)
}

export function destroyBot() {
    feeder.destroy()
}