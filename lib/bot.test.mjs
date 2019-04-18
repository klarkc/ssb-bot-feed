import path from 'path'
import test from 'ava'
import nock from 'nock'
import pull from 'pull-stream'
import bot from './bot'

test('throws when ssbClient errored', t => {
    t.throws(() => bot({})(Error('foo')), 'foo')
})

test.cb('console log when feedMonitor emits error', t => {
    t.plan(4)
    const feedMonitor = {
        create(urls, {onError}) {
            t.is(urls[0], 'foobar')
            onError(Error('foo'))
        },
        destroy() {}
    }
    let published = false
    const publish = () => {
        published = true
    }
    const sbot = { publish, whoami() { } }
    console.log = (msg, err) => {
        t.is(msg, 'ignoring feedMonitor msg:')
        t.is(err, 'foo')
        t.is(published, false)
        t.end()
    }
    bot({ feedMonitor, feedUrls: ['foobar'] })(null, sbot)
})

test.serial.cb('console log when publication timesout', t => {
    t.timeout(10000)

    const feedMonitor = {
        create(_, { onPost }) {
            onPost({
                title: 'foo',
                description: 'bar'
            })
        },
        destroy() { }
    }
    const publish = (post, cb) => {
        console.log = (msg) => {
            t.is(msg, 'timeout waiting for publication')
            t.end()
        }
    }
    const sbot = { publish, whoami() { } }
    bot({ feedMonitor, feedUrls: ['foobar'] })(null, sbot)
})

test.cb('console log when client connects', t => {
    const whoami = (cb) => {
        cb(null, {id: 'foo'})
    }
    const feedMonitor = {
        create() {},
        destroy() {},
    }
    console.log = (msg, id) => {
        t.is(msg, 'feedMonitor user ID:')
        t.is(id, 'foo')
        t.end() 
    }
    bot({feedMonitor})(null, { whoami })
})

test.cb('publish a post on sbot', t => {
    t.plan(5)
    const publish = (post) => {
        t.is(post.type, 'post')
        t.truthy((
            post.text.includes('foo') &&
            post.text.includes('bar')
        ))
        t.end()
    }
    const sbot = { publish, whoami(){} }
    const feedMonitor = {
        create(urls, {onPost}) {
            t.is(urls[0], 'thefeedUrl')
            onPost({
                title: 'foo',
                description: 'bar'
            })
        },
        destroy() {}
    }
    const config = {
        feedMonitor,
        feedUrls: ['thefeedUrl'],
    }
    let logs = 0;
    console.log = (msg, title) => {
        if (logs++ === 0) {
            t.is(msg, 'publishing update for entry:')
            t.is(title, 'foo')
        } else {
            t.is(msg, 'published entry:')
            t.truthy((
                title.includes('foo') &&
                title.includes('bar')
            ))
        }
    }
    bot(config)(null, sbot)
})

test.cb('console log when fails to download image on posting', t => {
    t.plan(3)
    const scope = nock('http://google.com')
        // .log(console.log)
        .get('/foo.jpg')
        .reply(404)

    let published = false
    const publish = () => {
        published = true
    }
    const sbot = {
        publish,
        whoami() { },
        blobs: {
            add(cb) {
                console.log = (msg, err) => {
                    t.is(msg, 'ignoring feedMonitor msg:')
                    t.is(err, 'foo')
                    t.is(published, false)
                    t.end()
                }
                cb(Error('foo'))
            }
        }
    }
    const feedMonitor = {
        create(urls, { onPost }) {
            onPost({
                title: 'foo',
                description: 'bar',
                image: {
                    title: 'foo',
                    url: 'http://google.com/foo.jpg',
                },
                link: 'foobar'
            })
        },
        destroy() { }
    }
    const config = {
        feedMonitor,
        feedUrls: ['thefeedUrl'],
    }
    bot(config)(null, sbot)
})

test.cb('publish a post with image in sbot', t => {
    t.plan(7)
    const scope = nock('http://google.com')
        // .log(console.log)
        .get('/foo.jpg')
        .replyWithFile(
            200,
            path.join(path.dirname(''), 'fixtures/image.jpg')
        )

    const publish = (post) => {
        t.truthy(
            post.text.includes('[foo]')
        )
        t.is(post.mentions.length, 1)
        t.is(post.mentions[0].link, '@foobah')
        t.is(post.mentions[0].name, undefined)
        t.is(post.mentions[0].size, undefined)
        t.is(post.mentions[0].type, undefined)
        scope.isDone()
        t.end()
    }
    const sbot = {
        publish,
        whoami() { },
        blobs: {
            add(cb) { cb(null, '@foobah')}
        }
    }
    const feedMonitor = {
        create(urls, { onPost }) {
            t.is(urls[0], 'thefeedUrl')
            onPost({
                title: 'foo',
                description: 'bar',
                image: {
                    title: 'foo',
                    url: 'http://google.com/foo.jpg',
                },
                link: 'foobar'
            })
        },
        destroy() { }
    }
    const config = {
        feedMonitor,
        feedUrls: ['thefeedUrl'],
    }
    bot(config)(null, sbot)
})

test.cb('publish a post with thumbnail in sbot', t => {
    t.plan(7)
    const scope = nock('http://google.com')
        // .log(console.log)
        .get('/foo.jpg')
        .replyWithFile(
            200,
            path.join(path.dirname(''), 'fixtures/image.jpg')
        )

    const publish = (post) => {
        t.truthy(
            post.text.includes('[foo]')
        )
        t.is(post.mentions.length, 1)
        t.is(post.mentions[0].link, '@foobah')
        t.is(post.mentions[0].name, undefined)
        t.is(post.mentions[0].size, undefined)
        t.is(post.mentions[0].type, undefined)
        scope.isDone()
        t.end()
    }
    const sbot = {
        publish,
        whoami() { },
        blobs: {
            add(cb) { cb(null, '@foobah') }
        }
    }
    const feedMonitor = {
        create(urls, { onPost }) {
            t.is(urls[0], 'thefeedUrl')
            onPost({
                title: 'foo',
                description: 'bar',
                ['media:thumbnail']: {
                    ['@']: {
                        url: 'http://google.com/foo.jpg',
                    }
                },
                link: 'foobar'
            })
        },
        destroy() { }
    }
    const config = {
        feedMonitor,
        feedUrls: ['thefeedUrl'],
    }
    bot(config)(null, sbot)
})

test.cb('publish a podcast on sbot', t => {
    const publish = (post) => {
        t.is(post.type, 'post')
        t.truthy(
            post.text.includes('bar.mp3')
        )
        t.end()
    }
    const sbot = { publish, whoami() { } }
    const feedMonitor = {
        create(urls, { onPost }) {
            onPost({
                title: 'foo',
                ['media:content']: {
                    ['@']: {
                        url: 'bar.mp3',
                    }
                },
            })
        },
        destroy() { }
    }
    const config = {
        feedMonitor,
        feedUrls: ['thefeedUrl'],
    }
    bot(config)(null, sbot)
})

test.cb('deny when a non-admin tries to add a feed', t => {
    t.plan(5)
    const fakeId = '@fakeId'
    const fakePost = {
        key: '%someKey',
        content: 'Pl**eas****e add feed ht****t***ps*:**/**/*ww*w.feedfo***ral***l.com/samp****le.*xml'
    }
    const publish = (post) => {
        t.is(post.type, 'post')
        t.is(post.text, 'Sorry, you\'re not allowed to do this')
    }
    const unbox = (cypher, cb) => {
        t.is(cypher, fakePost.content)
        t.end()
        cb(null, cypher.replaceAll(/\*/g, ''))
    }
    const createUserStream = ({ live, id }) => {
        t.is(live, true)
        t.is(id, fakeId)
        return pull.values([fakePost])
    }
    const whoami = cb => cb(null, {id: fakeId})
    const sbot = { publish, unbox, createUserStream, whoami }
    const feedMonitor = {
        create() {},
        destroy() {},
    }
    const config = {
        feedMonitor,
        feedUrls: [],
    }
    bot(config)(null, sbot)
})