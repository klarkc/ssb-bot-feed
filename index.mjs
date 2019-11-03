#!/bin/sh
":" //# comment; exec /usr/bin/env node --experimental-modules --no-warnings "$0" "$@"

import ssbClient from 'ssb-client'
import yargs from 'yargs'
import bot from './lib/bot.mjs'
import feedMonitor from './lib/feedMonitor.mjs'

const argv = yargs
    .demandCommand(1)
    .option('host', {
        alias: 'h',
        default: 'localhost',
        type: 'string',
        description: 'ssb-server host'
    })
    .option('port', {
        alias: 'p',
        default: 8008, 
        ype: 'number',
        description: 'ssb-server port'
    })
    .option('path', {
        alias: 'd',
        default: undefined, 
        ype: 'string',
        description: 'ssb-server .ssb path'
    })
    .argv

const feedUrls = argv._;
const {host, port, path} = argv;

const handler = bot({
    feedUrls,
    feedMonitor,
})

ssbClient(
    { host, port, path },
    handler
)