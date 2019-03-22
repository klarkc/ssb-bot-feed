export default config => (err, sbot) => {
    if (err) throw err
    const { bot, feedUrl } = config;

    const onPost = (entry) => {
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

    bot(feedUrl, { onPost, onError })
}