import ssbClient from 'ssb-client'
import ssbKeys from 'ssb-keys'


const keys = ssbKeys.loadOrCreateSync('./bot-private.key')
console.log('starting bot on ID', keys.id)
ssbClient(keys, {
    key: keys.id
})