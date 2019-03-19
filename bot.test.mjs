import test from 'ava'
import {createBot} from './bot'

test.cb('call onPost with a new rss entry', t => {
    t.plan(1)

    const url = 'foo'
    const onPost = entry => {
        t.deepEqual(entry, {})
        t.end()
    }
    createBot(url, {onPost})
})