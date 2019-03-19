import test from 'ava';
import {createBot} from './bot'

test('creates a bot object', t => {
    const bot = createBot();
    t.is(bot, {})
})