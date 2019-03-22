import ssbClient from 'ssb-client'
import setup from './lib/setup'
import bot from './lib/bot'

const feedUrl = process.argv[3];
if (feedUrl)
    throw Error('feed url required')

ssbClient(setup({
    feedUrl,
    bot,
}))