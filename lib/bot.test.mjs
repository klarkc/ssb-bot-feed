import path from 'path'
import fs from 'fs'
import test from 'ava'
import nock from 'nock'
import {createBot, destroyBot} from './bot'

const feedDomain = 'http://google.com'
const feedPath = '/feed'
const feedFixture = path.join(path.dirname(''), 'fixtures/first-feed.xml')
const feedData = fs.readFileSync(feedFixture, { encoding: 'utf8' });
const feedLength = 20
const feedURL = feedDomain + feedPath

function doTest(t, today = false) {
    t.plan(2)
    t.timeout(1000)

    let itemsReceived = []
    let errors = []
    let entryIdx = 0

    const proccessFeed = () => {
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

    const scope = nock(feedDomain)
        // .log(console.log)
        .get(feedPath)
        .reply(
            200,
            proccessFeed()
        )

    const done = () => {
        if (today) {
            t.is(
                itemsReceived.length,
                feedLength
            )
        } else {
            t.is(
                itemsReceived.length,
                0
            )
        }
        t.deepEqual(errors, [])

        scope.isDone()
        destroyBot()
        t.end()
    }

    const checkDone = () => {
        if (++entryIdx === feedLength) {
            done()
        }
    }

    const onPost = entry => {
        itemsReceived.push(entry)
        checkDone()
    }

    const onSkipPost = () => {
        checkDone()
    }

    const onError = error => {
        errors.push(error)
    }
    createBot([feedURL], { onPost, onSkipPost, onError })
}

const todayEntries = () => (t) => doTest(t, true)
const pastEntries = () => (t) => doTest(t, false)

test.serial.cb('call onPost every new entry for todayEntries', todayEntries())
test.serial.cb('does not call onPost for old entries', pastEntries())