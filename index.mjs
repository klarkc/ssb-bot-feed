#!/bin/sh
":" //# comment; exec /usr/bin/env node --experimental-modules --no-warnings "$0" "$@"

import ssbClient from 'ssb-client'
import yargs from 'yargs'
import fs from 'fs'
import bot from './lib/bot.mjs'
import feedMonitor from './lib/feedMonitor.mjs'

function main(argv) {
    const { host, port, path, template, urls } = argv
    
    const config = { feedUrls: urls, feedMonitor }
    if (template) {
        config.postTemplate = fs.readFileSync(template) 
    }

    const handler = bot(config)

    ssbClient(
        { host, port, path },
        handler
    )
}

function mainBuilder(yargs) {
    yargs.positional('urls', {
        describe: 'List of feed URLs separated by spaces',
        type: 'string'
    })
}

 yargs
    .command('$0 <urls..>', 'Run the bot.', mainBuilder, main)
    .help()
    .option('host', {
            alias: 'h',
            default: 'localhost',
            type: 'string',
            description: 'ssb-server host'
    })
    .option('port', {
            alias: 'p',
            default: 8008, 
            type: 'number',
            description: 'ssb-server port'
    })
    .option('path', {
            alias: 'd',
            default: undefined, 
            type: 'string',
            description: 'ssb-server .ssb path'
    })
    .option('template', {
            alias: 't',
            default: undefined,
            type: 'string',
            description: 'Markdown file path to be used as template. {image}, {title}, {description} and {link} tokens are available.'
    })
    .argv