import path from 'path'
import test from 'ava'
import nock from 'nock'

import {createBot, destroyBot} from './bot'

const feedDomain = 'http://google.com'
const feedPath = '/feed'
const feedFixture = path.join(path.dirname(''), 'fixtures/first-feed.xml')
const feedLength = 20
const feedURL = feedDomain + feedPath

test.cb('call onPost every new entry', t => {
    t.plan(2)
    t.timeout(1000)

    let itemsReceived = []
    let hasError = false

    nock(feedDomain)
        .get(feedPath)
        .replyWithFile(200, feedFixture)

    const done = () => {
        t.is(itemsReceived.length, feedLength)
        t.is(hasError, false)
        nock.cleanAll()
        destroyBot()
        t.end()
    }

    const onPost = entry => {
        itemsReceived.push(entry)
        
        if (itemsReceived.length === feedLength) {
            done();
        }
    }
    
    const onError = () => {
        error = true
    }
    createBot(feedURL, {onPost, onError})
})