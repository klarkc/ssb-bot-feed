import path from 'path'
import fs from 'fs'
import test from 'ava'
import nock from 'nock'
import {create, destroy} from './feedMonitor'

function doTest(t, feeds, today = false) {
    t.plan(2)
    t.timeout(1000)

    const feedsUrls = feeds.map(
        f => f.domain + f.path
    )
    const totalSize = feeds
        .map(f => f.size)
        .reduce((p, n) => p + n, 0)
    let remaining = totalSize
    let itemsReceived = []
    let errors = []

    const proccessFeed = f => {
        const feedData = fs.readFileSync(
            path.join(path.dirname(''), 'fixtures/' + f.file),
            { encoding: 'utf8' }
        );
        let data = feedData
        if (today) {
            const date = new Date().toISOString();
            data = feedData.replace(
                /<pubDate>.*<\/pubDate>/g,
                `<pubDate>${date}</pubDate>`
            )
        }

        return data
    }

    const scopes = feeds.map( f => {
        return nock(f.domain)
        // .log(console.log)
        .get(f.path)
        .reply(
            200,
            proccessFeed(f)
        )
    })

    const done = () => {
        if (today) {
            t.is(
                itemsReceived.length,
                totalSize
            )
        } else {
            t.is(
                itemsReceived.length,
                0
            )
        }
        t.deepEqual(errors, [])
        scopes.forEach(
            scope => scope.isDone()
        )
        destroy()
        t.end()
    }

    const checkDone = () => {
        remaining = remaining - 1
        // console.log(remaining)
        if (remaining < 1) {
            done()
        }
    }

    const onPost = entry => {
        // console.log('post', entry.pubDate)
        itemsReceived.push(entry)
        checkDone()
    }

    const onSkipPost = () => {
        checkDone()
    }

    const onError = error => {
        errors.push(error)
    }

    create(feedsUrls, { onPost, onSkipPost, onError })
}

const feeds = [
    {
        domain: 'http://google.com',
        path: '/feed',
        file: 'first-feed.xml',
        size: 20,
    }, {
        domain: 'http://google.com',
        path: '/feed2',
        file: 'second-feed.xml',
        size: 20,
    }
]

const todayEntries = () => (t) =>
    doTest(t, feeds, true)
const pastEntries = () => (t) =>
    doTest(t, feeds, false)

test.serial.cb('call onPost every new entry for todayEntries', todayEntries())
test.serial.cb('does not call onPost for old entries', pastEntries())