import RssFeedEmitter from 'rss-feed-emitter'

const feeder = new RssFeedEmitter();

export function createBot(
    url,
    {
        onPost,
        onSkipPost = () => {},
        onError
    }
    ) {
    feeder.add({ url })
    feeder.on('new-item', entry => {
        const yday = new Date()
        yday.setDate(yday.getDate() - 1)
        if (true) {
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