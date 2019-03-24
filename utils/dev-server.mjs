import path from 'path'
import Server from 'ssb-server'
import Config from 'ssb-config/inject'

const config = Config('ssb', {
    port: 9999,
    path: path.resolve(path.dirname(''), '../.ssb')
})

const server = Server(config)
server.whoami((err, feed) => {
    console.log(feed)
    server.close(() => console.log('closing the server!'))
})