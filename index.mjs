#!/bin/sh
":" //# comment; exec /usr/bin/env node --experimental-modules --no-warnings "$0" "$@"

import ssbClient from 'ssb-client'
import setup from './lib/setup'
import bot from './lib/bot'
import yargs from 'yargs'

const argv = yargs
    .demandCommand(1)
    .option('host', {alias: 'h', default: 'localhost'})
    .option('port', {alias: 'p', default: 8008})
    .option('path', {alias: 'd', default: undefined})
    .argv

const feedUrls = argv._;
const {host, port, path} = argv;

const handler = setup({
    feedUrls,
    bot,
})

ssbClient(
    { host, port, path },
    handler
)