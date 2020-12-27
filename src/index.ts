import * as fs from "fs";
import { Definition, BSB } from './bsb'

import express from 'express';

let rawdata = fs.readFileSync('../../BSB_lan_def2JSON/all.json')
let config = JSON.parse(rawdata as any)
let definition = new Definition(config)

let bsb = new BSB(definition, { family: 163, var: 5 }, "DE")
bsb.connect('192.168.203.179', 1000)

const app = express()

app.set('json spaces', 2)
app.get('/JQ=:query', (req, res) => {


    let query: number[] | number = req.params.query
        .split(',')
        .map(item => parseInt(item, 10))

    if (query.length == 1)
        query = query[0]
    bsb.get(query)
        .then(data => res.json(data))
})

app.listen(8081, () => {
    console.log('Example app listening at http://localhost:8081')
})

// setInterval(() => {
//     bsb.send();
// }, 5000);

// bsb.set("Temp=22°")
//     -> Error
//     -> okay

// bsb.inf("Temp=22°")
//     -> Error
//     -> okay

// bsb.get("Temp?")
//     -> Error
//     -> okay result Temp=21!

let nm = bsb.Log$.subscribe((data) => {
    console.log("RXJS:" + data);
});

// bsb.Log$.pipe(filter(data => data == true), map()).subscribe()

// setTimeout(() => nm.unsubscribe(), 10000);



//#region comment howt read device familiy & Variant
// {
//     "6225": {
//       "name": "Gerätefamilie",
//       "error": 0,
//       "value": "163",
//       "desc": "",
//       "dataType": 0,
//       "readonly": 0,
//       "unit": ""
//     }
//   }

// {
//     "6226": {
//       "name": "Gerätevariante",
//       "error": 0,
//       "value": "5",
//       "desc": "",
//       "dataType": 0,
//       "readonly": 0,
//       "unit": ""
//     }
//   }
//#endregion