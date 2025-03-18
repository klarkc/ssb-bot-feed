import test from "ava"
import pull from 'pull-stream'
import commandFilter from './commandFilter'

function doCommandTest(content, result, t) {
    return new Promise((resolve) => {
        const mock = { content }
        const onResult = (e, res) => {
            t.is(result, res.length)
            resolve();
        }
        pull(
            pull.values([mock]),
            pull.filter(commandFilter),
            pull.collect(onResult)
        )
    });
}

test('commandFilter ignore no related msgs', (t) => {
    return doCommandTest('foo bar', 0, t)
})

test('commandFilter filter valid add', (t) => {
    return doCommandTest('add http://foobar', 1, t)
})

test('commandFilter filter valid delete', (t) => {
    return doCommandTest('delete http://foobar', 1, t)
})

test('commandFilter filter valid remove', (t) => {
    return doCommandTest('remove http://foobar', 1, t)
})
