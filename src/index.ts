import * as fs from "fs";
import { BSB, MSG_TYPE } from './bsb'
import { Definition } from './Definition'

import express from 'express';
import { KeyItem } from "./interfaces";
import { add_v0_API } from "./bsbAPI"
import { Helper } from "./Helper";

let rawdata = fs.readFileSync('../../BSB_lan_def2JSON/all.json')
let config = JSON.parse(rawdata as any)
let definition = new Definition(config)

let language = 'DE'

let bsb = new BSB(definition, { family: 163, var: 5 }, 0xC3)
bsb.connect('192.168.203.179', 1000)

const app = express()
// make JSON result easier to read
app.set('json spaces', 2)

add_v0_API(app, bsb, definition, language)

app.listen(8081, () => {
    console.log('Example app listening at http://localhost:8081')
})

let nm = bsb.Log$.subscribe((log) => {

    // ToDo implement equivalent to telnet log
    console.log(
        Helper.toHexString(log.msg.data).padEnd(50, ' ') + MSG_TYPE[log.msg.typ].padStart(4, ' ') + ' '
        + Helper.toHexString([log.msg.src])
        + ' -> ' + Helper.toHexString([log.msg.dst])
        + ' ' + log.command.command + ' ' + Helper.getLanguage(log.command?.description, language) + ' (' + log.command?.parameter + ') = ' 
        + ((log.value ?? '---') as any).toString(language)
    )
});

// bsb.Log$.pipe(filter(data => data == true), map()).subscribe()
