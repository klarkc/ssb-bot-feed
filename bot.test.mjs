import path from 'path'
import test from 'ava'
import nock from 'nock'

import {createBot} from './bot'

const feedDomain = 'http://foo.bar/'
const feedPath = 'feeds'
const feedFixture = path.join(path.dirname(''), 'fixtures/feed.xml')
const feedURL = feedDomain + feedPath

test.cb('call onPost with a new entry', t => {
    t.plan(1)

    nock(feedDomain)
        .get(feedPath)
        .replyWithFile(200, feedFixture)

    const onPost = entry => {
        t.deepEqual(entry, {})
        t.end()
    }
    createBot(feedURL, {onPost})
})