import path from 'path'
import test from 'ava'
import nock from 'nock'

import {createBot} from './bot'

const feedDomain = 'http://foo.bar/'
const feedPath = 'feeds'
const feedFixture = path.join(path.dirname(''), 'fixtures/first-feed.xml')
const feedLength = 20
const feedURL = feedDomain + feedPath

test.cb('call onPost with a new entry', t => {
    t.plan(1)

    let itemsReceived = []

    nock(feedDomain)
        .get(feedPath)
        .replyWithFile(200, feedFixture)

    const done = () => {
        t.is(itemsReceived.length, feedLength)
        nock.cleanAll()
        t.end()
    }

    const onPost = entry => {
        itemsReceived.push(entry);

        if (itemsReceived.length === feedLength) {
            done();
        }
    }
    createBot(feedURL, {onPost})
})