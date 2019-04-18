import test from "ava"
import decodePrivate from './decodePrivate'

function uncrypt(data) {
    return data.replace(/\*/g, '')
}

test.cb('ignore not encrypted msgs', (t) => {
    const data = {
        content: {}
    }
    const done = (err, d) => {
        t.is(null, err)
        t.is(data, d)
        t.end()
    }
    const sbot = {}
    decodePrivate(sbot)(data, done)
})

test.cb('decode encrypted msgs', (t) => {
    t.plan(3)
    const data = {
        content: "e*n*cry**p*t*e*dmsg"
    }
    const done = (err, d) => {
        t.is(err, null)
        t.is(
            d.content.text,
            uncrypt(data.content)
        )
        t.end()
    }
    const sbot = {
        unbox(cypher, cb) {
            t.is(cypher, data.content)
            cb(null, {text: uncrypt(cypher)})
        }
    }
    decodePrivate(sbot)(data, done)
})