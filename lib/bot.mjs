import RssFeedEmitter from 'rss-feed-emitter'

const feeder = new RssFeedEmitter();

export function createBot(
    urls,
    {
        onPost,
        onSkipPost = () => {},
        onError
    }
    ) {
    urls.forEach(url => {
        feeder.add({ url })
    })
    feeder.on('new-item', entry => {
        const yday = new Date()
        yday.setDate(yday.getDate() - 1)
        if (entry.pubDate > yday) {
            onPost(entry)
        } else {
            onSkipPost(entry)
        }
    })
    feeder.on('error', onError)
}

export function destroyBot() {
    feeder.destroy()
}

export default {
    createBot,
    destroyBot
}