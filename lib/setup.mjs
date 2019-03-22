import striptags from 'striptags'

export default config => (err, sbot) => {
    if (err) throw err
    const { bot, feedUrl } = config;
    const {createBot, destroyBot} = bot;

    const onPostPublished = (err, msg) => {
        if (err) {
            console.log(
                'error publishing:',
                err.message
            )
        } else {
            console.log(
                'published:',
                msg.value.content.text.substr(0, 80)
            )
        }
    }

    const onPost = (entry) => {
        console.log(
            'publishing update for entry:',
            entry.title,
        )
        let image = ''
        if (entry.image) {
            image = `![${entry.image.title}](${entry.image.url})`
        }

        if (entry['media:thumbnail']) {
            image = `![${entry.title}](${entry['media:thumbnail']['@'].url})`
        }

        let description = ''
        if (entry.description) {
            const html = entry.description.replace("<![CDATA[", "").replace("]]>", "")
            description = striptags(html)
        }
        const text = `
# ${entry.title}

${image}

${description}

Link: [${entry.link}](${entry.link})
`
        const type = 'post'
        console.log(text);
        // sbot.publish({ type, text }, onPostPublished)
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