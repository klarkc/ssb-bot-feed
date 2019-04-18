import test from "ava"
import decodePrivate from './decodePrivate.js'

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
        decodePrivate(data, done)
    });
})