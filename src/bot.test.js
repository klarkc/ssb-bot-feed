import path, { resolve } from 'path'
import test from 'ava'
import nock from 'nock'
import bot from './bot.js'
import stringLength from './stringLength.js'

test('throws when ssbClient errored', t => {
    const error = t.throws(() => bot({})(Error('foo')));
    t.is(error.message, 'foo');
})

test.serial('console log when feedMonitor emits error', t => {
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
    return new Promise((resolve) => {
        console.log = (msg, err) => {
            t.is(msg, 'ignoring feedMonitor msg:')
            t.is(err, 'foo')
            t.is(published, false)
            resolve();
        }
        bot({ feedMonitor, feedUrls: ['foobar'] })(null, sbot)
    });
})

test.serial('console log when publication timesout', t => {
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
    return new Promise((resolve) => {
        const publish = (post, cb) => {
            console.log = (msg) => {
                t.is(msg, 'timeout waiting for publication')
                resolve();
            }
        }
        const sbot = { publish, whoami() { } }
        bot({ feedMonitor, feedUrls: ['foobar'] })(null, sbot)
    });
})

test.serial('console log when client connects', t => {
    const whoami = (cb) => {
        cb(null, {id: 'foo'})
    }
    const feedMonitor = {
        create() {},
        destroy() {},
    }
    return new Promise((resolve) => {
        console.log = (msg, id) => {
            t.is(msg, 'feedMonitor user ID:')
            t.is(id, 'foo')
            resolve();
        }
        bot({feedMonitor})(null, { whoami })
    })
})

test.serial('publish a post on sbot', t => {
    t.plan(5)
    const feedMonitor = {
        create(urls, { onPost }) {
            t.is(urls[0], 'thefeedUrl')
            onPost({
                title: 'foo',
                description: 'bar'
            })
        },
        destroy() { }
    }
    const config = {
        feedMonitor,
        feedUrls: ['thefeedUrl'],
    }
    return new Promise(resolve => {
        const publish = (post) => {
            t.is(post.type, 'post')
            t.truthy((
                post.text.includes('foo') &&
                post.text.includes('bar')
            ))
            resolve();
        }
        const sbot = { publish, whoami() { } }
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
    });
})

test.serial('truncates a long post to fit 8192 bytes on sbot', t => {
    t.plan(4)
    const feedMonitor = {
        create(urls, { onPost }) {
            t.is(urls[0], 'thefeedUrl')
            onPost({
                title: 'foo',
                description: '#'.repeat(8191 - 41), // // 41 is title, white spaces, ...
            })
        },
        destroy() { }
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
    return new Promise(resolve => {
        const publish = (post) => {
            t.true(stringLength(post.text) <= 8192)
            resolve()
        }
        const sbot = { publish, whoami() { } }
        bot(config)(null, sbot)
    });
})

test.serial('console log when fails to download image on posting', t => {
    t.plan(3)
    let published = false
    const publish = () => {
        published = true
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
    return new Promise((resolve) => {
        const sbot = {
            publish,
            whoami() { },
            blobs: {
                add(cb) {
                    console.log = (msg, err) => {
                        t.is(msg, 'ignoring feedMonitor msg:')
                        t.is(err, 'foo')
                        t.is(published, false)
                        resolve();
                    }
                    cb(Error('foo'))
                }
            }
        }
        bot(config)(null, sbot)
    });
})

test('publish a post with image in sbot', t => {
    t.plan(7)
    const scope = nock('http://google.com')
        // .log(console.log)
        .get('/foo.jpg')
        .replyWithFile(
            200,
            path.join(path.dirname(''), 'fixtures/image.jpg')
        )

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
    return new Promise((resolve) => {
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
            resolve();
        }
        const sbot = {
            publish,
            whoami() { },
            blobs: {
                add(cb) { cb(null, '@foobah') }
            }
        }
        bot(config)(null, sbot)
    });
})

test('publish a post with thumbnail in sbot', t => {
    t.plan(7)
    const scope = nock('http://google.com')
        // .log(console.log)
        .get('/foo.jpg')
        .replyWithFile(
            200,
            path.join(path.dirname(''), 'fixtures/image.jpg')
        )

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
    return new Promise((resolve) => {
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
            resolve();
        }
        const sbot = {
            publish,
            whoami() { },
            blobs: {
                add(cb) { cb(null, '@foobah') }
            }
        }
        bot(config)(null, sbot)
    });
})

test('publish a podcast on sbot', t => {
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
    return new Promise(resolve => {
        const publish = (post) => {
            t.is(post.type, 'post')
            t.truthy(
                post.text.includes('bar.mp3')
            )
            resolve();
        }
        const sbot = { publish, whoami() { } }
        bot(config)(null, sbot)
    });
})

test('publish a post using template on sbot', t => {
    t.plan(4)
    const scope = nock('http://google.com')
        .get('/foo.jpg')
        .replyWithFile(
            200,
            path.join(path.dirname(''), 'fixtures/image.jpg')
        )

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
        postTemplate: 'Title: {title} Image: {image} Desc: {description} Link: {link}'
    }
    return new Promise(resolve => {
        const publish = (post) => {
            t.truthy(post.text.includes('Title: foo'))
            t.truthy(post.text.includes('Image: ![foo]'))
            t.truthy(post.text.includes('Desc: bar'))
            t.truthy(post.text.includes('Link: foobar'))
            scope.isDone()
            resolve();
        }
        const sbot = {
            publish,
            whoami() { },
            blobs: {
                add(cb) { cb(null, '@foobah') }
            }
        }
        bot(config)(null, sbot)
    });
})

test.skip('deny when a non-admin tries to add a feed', async t => {
    t.plan(5)
    const fakeId = '@fakeId'
    const fakePost = {
        key: '%someKey',
        content: 'Pl**eas****e add feed ht****t***ps*:**/**/*ww*w.feedfo***ral***l.com/samp****le.*xml'
    }
    const publish = (post) => {
        t.is(post.type, 'post')
        t.is(post.text, 'Sorry, you\'re not allowed to do this')
        t.end()
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
    const whoami = cb => cb(null, { id: fakeId })
    const sbot = { publish, unbox, createUserStream, whoami }
    const feedMonitor = {
        create() { },
        destroy() { },
    }
    const config = {
        feedMonitor,
        feedUrls: [],
    }
    bot(config)(null, sbot)
})