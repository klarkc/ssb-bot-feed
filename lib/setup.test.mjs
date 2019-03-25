import path from 'path'
import test from 'ava'
import nock from 'nock'
import setup from './setup'

test('throws when ssbClient errored', t => {
    t.throws(() => setup({})(Error('foo')), 'foo')
})

test.cb('console log when bot emits error', t => {
    t.plan(4)
    const bot = {
        createBot(feedUrl, {onError}) {
            t.is(feedUrl, 'foobar')
            onError(Error('foo'))
        },
        destroyBot() {}
    }
    let published = false
    const publish = () => {
        published = true
    }
    const sbot = { publish, whoami() { } }
    console.log = (msg, err) => {
        t.is(msg, 'ignoring bot msg:')
        t.is(err, 'foo')
        t.is(published, false)
        t.end()
    }
    setup({ bot, feedUrl: 'foobar' })(null, sbot)
})

test.cb('console log when client connects', t => {
    const whoami = (cb) => {
        cb(null, {id: 'foo'})
    }
    const bot = {
        createBot() {},
        destroyBot() {},
    }
    console.log = (msg, id) => {
        t.is(msg, 'bot user ID:')
        t.is(id, 'foo')
        t.end() 
    }
    setup({bot})(null, { whoami })
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
    const bot = {
        createBot(feedUrl, {onPost}) {
            t.is(feedUrl, 'thefeedUrl')
            onPost({
                title: 'foo',
                description: 'bar'
            })
        },
        destroyBot() {}
    }
    const config = {
        bot,
        feedUrl: 'thefeedUrl',
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
    setup(config)(null, sbot)
})

test.cb('publish a post with image in sbot', t => {
    t.plan(5)
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
        t.is(post.metions.length, 1)
        t.is(post.metions[0].link, 'string')
        t.is(post.metions[0].name, 'foo.jpg')
        t.is(post.metions[0].size, 999)
        t.is(post.metions[0].type, 'image/jpg')
        scope.isDone()
        t.end()
    }
    const sbot = {
        publish,
        whoami() { },
        blobs: {
            add(cb) { cb(null, 'foobah')}
        }
    }
    const bot = {
        createBot(feedUrl, { onPost }) {
            t.is(feedUrl, 'thefeedUrl')
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
        destroyBot() { }
    }
    const config = {
        bot,
        feedUrl: 'thefeedUrl',
    }
    setup(config)(null, sbot)
})