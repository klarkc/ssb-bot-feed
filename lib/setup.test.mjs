import test from 'ava';
import setup from './setup';

test('throws when ssbClient errored', t => {
    t.throws(() => setup(Error('foo')), 'foo')
})

test.cb('console log when bot emits error', t => {
    t.plan(4)
    const bot = (url, {onError}) => {
        t.is(url, 'foobar')
        onError(Error('foo'))
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
    setup(null, {publish}, { bot, url: 'foobar' })
})

test.cb('publish a post on sbot', t => {
    t.plan(3)
    const publish = (post) => {
        t.is(post.type, 'post')
        t.is(post.text, 'foo\n\nbar')
        t.end()
    }
    const sbot = { publish }
    const bot = (url, {onPost}) => {
        t.is(url, 'theurl')
        onPost({
            title: 'foo',
            description: 'bar'
        })
    }
    const config = {
        bot,
        url: 'theurl',
    }
    setup(null, sbot, config)
})