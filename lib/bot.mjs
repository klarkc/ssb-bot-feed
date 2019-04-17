// import Turndown from 'turndown'
import striptags from 'striptags'
import pull from 'pull-stream'
import toPull from 'stream-to-pull-stream'
import request from 'request'

function setCallbackTimeout(cb, onTimeout, waitingTime = 5000) {
    const checker = setTimeout(onTimeout, waitingTime)
    return (...args) => {
        cb(...args)
        clearTimeout(checker)
    }
}

export default config => (err, sbot) => {
    if (err) throw err
    const { feedMonitor, feedUrls } = config;
    const createFeedMonitor = feedMonitor.create;

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

    const onPostTimeout = () => {
        console.log('timeout waiting for publication')
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

        let link = entry.link
        if (entry['media:content']) {
            link = entry['media:content']['@'].url
        } 

        const renderPost = (image = '', mentions) => {
            const text = `
# ${entry.title}

${image}

${description}

Link: [${link}](${link})
`
            sbot.publish(
                { type: 'post', text, mentions },
                setCallbackTimeout(onPostPublished, onPostTimeout)
            )
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
            'ignoring feedMonitor msg:',
            err.message
        )
    }

    const onSbotConnect = (_, keys) => {
        console.log(
            'feedMonitor user ID:',
            keys.id
        )
    }

    sbot.whoami(onSbotConnect)

    createFeedMonitor(feedUrls, { onPost, onError })
}