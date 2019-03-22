export default config => (err, sbot) => {
    if (err) throw err
    const { bot, feedUrl } = config;
    const {createBot, destroyBot} = bot;

    const onPost = (entry) => {
        console.log(
            'publishing update for entry:',
            entry.title,
        )
        const text = entry.title +
            '\n\n' +
            entry.description
        const type = 'post'
        sbot.publish({ type, text })
    }

    const onError = (err) => {
        console.log(
            'ignoring bot msg:',
            err.message
        )
    }

    const onSbotConnect = (_, keys) => {
        console.log(
            'bot user ID:',
            keys.id
        )
    }

    sbot.whoami(onSbotConnect)

    createBot(feedUrl, { onPost, onError })
}