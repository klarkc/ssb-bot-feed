import test from 'ava'

import {createBot} from './bot'

test.cb('call onPost with a new entry', t => {
    t.plan(1)

    const feedURL = 'http://github.com/nikezono.atom'
    const onPost = entry => {
        t.deepEqual(entry, {})
        t.end()
    }
    createBot(feedURL, {onPost})
})