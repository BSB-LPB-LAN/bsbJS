import { BSBDefinition, KeyItem, Category } from './interfaces'
import express from 'express';
import { BSB, MSG_TYPE } from './bsb';
import { Definition } from './Definition';
import * as Payloads from './Payloads/'
import { Helper } from './Helper'

export interface QueryResult extends KeyItem<QueryResultEntry> { }

export interface QueryResultEntry {
    name: string
    error: number
    value: string
    desc: string
    dataType: number
    readonly: number
    unit: string
}

export function add_v0_API(app: express.Express, bsb: BSB, definition: Definition, language: string) {

    // app.post('/JQ') -> paramter from body
    app.get(['/JQ=:query', '/api/v0/JQ=:query'], (req, res) => {
        let query = req.params.query
            .split(',')
            .map(item => parseInt(item, 10))

        bsb.get(query)
            .then(data => {
                let result: QueryResult = {}
                for (let res of data) {

                    if (res) {

                        let error = 0
                        let value = res.value?.toString(language)
                        let desc = ''
                        if (res.value instanceof Payloads.Error) {
                            error = res.value.value ?? 0
                            value = ''
                        }

                        if (res.value instanceof Payloads.Enum) {
                            desc = value
                            value = res.value.value?.toString() ?? ''
                        }

                        result[res.command.parameter] = {
                            name: Helper.getLanguage(res.command.description, language) ?? '',
                            error: error,
                            value: value,
                            desc: desc,
                            dataType: res.command.type.datatype_id,
                            readonly: ((res.command.flags?.indexOf('READONLY') ?? -1) != -1) ? 1 : 0,
                            unit: Helper.getLanguage(res.command.type.unit, language) ?? ''
                        }
                    }
                }
                res.json(result)
            })
    })

    app.get(['/JR=:query', '/api/v0/JR=:query'], (req, res) => {
        let query = req.params.query
            .split(',')
            .map(item => parseInt(item, 10))

        bsb.getResetValue(query)
            .then(data => {
                let result: QueryResult = {}
                for (let res of data) {

                    if (res) {

                        let error = 0
                        let value = res.value?.toString(language)
                        let desc = ''
                        if (res.value instanceof Payloads.Error) {
                            error = res.value.value ?? 0
                            value = ''
                        }

                        if (res.value instanceof Payloads.Enum) {
                            desc = value
                            value = res.value.value?.toString() ?? ''
                        }

                        result[res.command.parameter] = {
                            name: Helper.getLanguage(res.command.description, language) ?? '',
                            error: error,
                            value: value,
                            desc: desc,
                            dataType: res.command.type.datatype_id,
                            readonly: ((res.command.flags?.indexOf('READONLY') ?? -1) != -1) ? 1 : 0,
                            unit: Helper.getLanguage(res.command.type.unit, language) ?? ''
                        }
                    }
                }
                res.json(result)
            })
    })

    app.post(['/JS', '/api/v0/JS'], (req, res) => {
        var data = "";
        req.on('data', function (chunk) { data += chunk })
        req.on('end', function () {
            let body = JSON.parse(data)
            let param = parseInt(body.Parameter, 10)

            // {
            //     "Parameter": cfg.parameters[0],
            //     "Value": cfg.value,
            //     "Type": cfg.requesttype == "INF" ? "0" : "1" // "Type" (0 = INF, 1 = SET) 
            // }

            bsb.set(param, body.Value)
                .then(data => {
                    let status = { status: data?.msg.typ == MSG_TYPE.ACK ? 1 : 0 }
                    let result: KeyItem<typeof status> = {}
                    result[param] = status
                    res.json(result)
                })
        })
    })

    app.get('/JK=:query', (req, res) => {
        if (req.params.query.toUpperCase() == 'ALL') {
            let resultAll: KeyItem<{ name: string, min: number, max: number }> = {}
            let i = 0
            for (let key in definition.config.categories) {

                let item = definition.config.categories[key]
                if (item.commands.length > 0) {
                    resultAll[i] = {
                        name: Helper.getLanguage(item.name, language) ?? '',
                        min: item.min,
                        max: item.max
                    }
                }
                i++
            }
            res.json(resultAll)
        }
        else {
            let resultID: KeyItem<{ name: string, possibleValues: { enumValue: number, desc: string }[], isswitch: number, dataType: number, readonly: number, unit: string }> = {}
            let i = 0
            let cat: Category | null = null
            for (let key in definition.config.categories) {
                if (i == parseInt(req.params.query, 10)) {
                    cat = definition.config.categories[key]
                }
                i++
            }
            if (cat) {
                // todo: fix enumValue from hex -> number
                // check strange results for 701-703 
                // bsbLAN != bsbJS

                for (let i = cat.min; i <= cat.max; i++) {
                    let item = definition.findParam(i, bsb.device)
                    if (item) {

                        let enumValues = []

                        for (let key in item.enum) {
                            enumValues.push({
                                enumValue: key,
                                desc: Helper.getLanguage(item.enum[key], language) ?? 'missing ' + key
                            })
                        }

                        resultID[item.parameter] = {
                            name: Helper.getLanguage(item.description, language) ?? '',
                            possibleValues: enumValues as any,
                            dataType: item.type.datatype_id,
                            isswitch: 0,
                            readonly: ((item.flags?.indexOf('READONLY') ?? -1) != -1) ? 1 : 0,
                            unit: Helper.getLanguage(item.type.unit, language) ?? ''
                        }
                    }
                }
            }

            res.json(resultID)

        }
    })

    app.get('/JI', (req, res) => {
        let result = {
            "name": "bsbJS-LAN",
            "version": "1.1.53-20201110150552",
            "freeram": 9999999,
            "uptime": 1317313836,
            "MAC": "00:00:00:00:00:00",
            "freespace": 0,
            "bus": "BSB",
            "buswritable": 1,
            "busaddr": 67,
            "busdest": 0,
            "monitor": 1,
            "verbose": 1,
            // "onewirebus": 7,
            // "onewiresensors": 0,
            // "dhtbus": [
            //   { "pin": 2 },
            //   { "pin": 3 }
            // ],
            "protectedGPIO": [
            //   { "pin": 0 },
            //   { "pin": 1 },
            ],
            "averages": [
                // { "parameter": 8700 },
                // { "parameter": 8326 }
              ],
              "logvalues": 0, // oder halt 1
              "loginterval": 3600,
              "logged": [
                // { "parameter": 8700 },
                // { "parameter": 8743 },
                // { "parameter": 8314 }
              ]
        }
        res.json(result)
    })

    app.get('/JV', (req, res) => {
        let result = { "api_version": "2.0" }
        res.json(result)
    })

}