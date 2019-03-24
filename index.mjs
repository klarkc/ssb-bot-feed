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
    .argv

const feedUrl = argv._[0];
const {host, port} = argv;

ssbClient({host, port}, setup({
    feedUrl,
    bot,
}))