export function setup(err, sbot, config) {
    if (err) throw err
    const {bot, url} = config;

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

    bot(url, {onPost, onError})
}