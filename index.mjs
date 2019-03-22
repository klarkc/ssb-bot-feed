import ssbClient from 'ssb-client'
import setup from './lib/setup'
import bot from './lib/bot'

ssbClient(setup({
    feedUrl: 'foo',
    bot,
}))