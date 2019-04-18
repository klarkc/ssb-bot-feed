import test from "ava"
import decodePrivate from './decodePrivate.js'

function unecrypt(data) {
    return data.replace(/\*/g, '')
}

test('ignore not encrypted msgs', (t) => {
    const data = {
        content: {}
    }
    return new Promise((resolve) => {
        const done = (err, d) => {
            t.is(null, err)
            t.is(data, d)
            resolve();
        }
        const sbot = {}
        decodePrivate(sbot)(data, done)
    });
})

test('decode encrypted msgs', (t) => {
    t.plan(3)
    const data = {
        content: "e*n*cry**p*t*e*dmsg"
    }
    const sbot = {
        unbox(cypher, cb) {
            t.is(cypher, data.content)
            cb(null, unecrypt(cypher))
        }
    }
    return new Promise((resolve) => {
        const done = (err, d) => {
            t.is(err, null)
            t.is(
                d.content.text,
                unecrypt(data.content)
            )
            resolve()
        }
        decodePrivate(sbot)(data, done)
    });
})