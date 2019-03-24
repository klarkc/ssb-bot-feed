#!/usr/bin/env node --experimental-modules --no-warnings

import ssbClient from 'ssb-client'
import setup from './lib/setup'
import bot from './lib/bot'
import yargs from 'yargs'

const feedUrl = yargs
    .demandCommand(1)
    .argv
    ._[0];

ssbClient(setup({
    feedUrl,
    bot,
}))