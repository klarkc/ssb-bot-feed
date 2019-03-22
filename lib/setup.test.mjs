import test from 'ava';
import setup from './setup';

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
    console.log = (msg, err) => {
        t.is(msg, 'ignoring bot msg:')
        t.is(err, 'foo')
        t.is(published, false)
        t.end()
    }
    setup({ bot, feedUrl: 'foobar' })(null, {publish})
})

test.cb('publish a post on sbot', t => {
    t.plan(3)
    const publish = (post) => {
        t.is(post.type, 'post')
        t.is(post.text, 'foo\n\nbar')
        t.end()
    }
    const sbot = { publish }
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
    setup(config)(null, sbot)
})