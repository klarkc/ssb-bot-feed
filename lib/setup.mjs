// import Turndown from 'turndown'
import striptags from 'striptags'
import pull from 'pull-stream'
import toPull from 'stream-to-pull-stream'
import request from 'request'

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
                'published entry:',
                msg.value.content.text.substr(0, 80)
            )
        }
    }

    const onPost = (entry) => {
        console.log(
            'publishing update for entry:',
            entry.title,
        )

        let description = ''
        if (entry.description) {
            const html = entry.description.replace("<![CDATA[", "").replace("]]>", "")
            // FIXME: Turndown not being imported
            // const service = new Turndown()
            // description = service.turndown(html)
            description = striptags(html)
        }

        let imageUrl = '';
        let imageTitle = '';
        if (entry.image) {
            imageTitle = entry.image.title || entry.title
            imageUrl = entry.image.url
        }

        if (entry['media:thumbnail']) {
            imageTitle = entry.title
            imageUrl = entry['media:thumbnail']['@'].url
        }

        const renderPost = (image = null, mentions) => {
            const text = `
# ${entry.title}

${image}

${description}

Link: [${entry.link}](${entry.link})
`
            sbot.publish({ type: 'post', text, mentions }, onPostPublished)
        }

        if (imageUrl) {
            pull(
                toPull.source(request(imageUrl)),
                sbot.blobs.add((err, hash) => {
                    if (err) onError(err)
                    const image = `![${imageTitle}](${hash})`
                    const mentions = [{
                        link: hash,
                        // FIXME: learn how to get props below
                        // name: imageTitle,
                        // size: 999,
                        // type: 'image/jpg'
                    }]
                    renderPost(image, mentions)
                })
            )
        } else {
            renderPost()
        }
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