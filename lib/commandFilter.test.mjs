import test from "ava"
import pull from 'pull-stream'
import commandFilter from './commandFilter'

function doCommandTest(content, result, t) {
    const mock = { content }
    const onResult = (e, res) => {
        t.is(result, res.length)
        t.end()
    }
    pull(
        pull.values([mock]),
        pull.filter(commandFilter),
        pull.collect(onResult)
    )
}

test.cb('commandFilter ignore no related msgs', (t) => {
    doCommandTest('foo bar', 0, t)
})

test.cb('commandFilter filter valid add', (t) => {
    doCommandTest('add http://foobar', 1, t)
})

test.cb('commandFilter filter valid delete', (t) => {
    doCommandTest('delete http://foobar', 1, t)
})

test.cb('commandFilter filter valid remove', (t) => {
    doCommandTest('remove http://foobar', 1, t)
})
