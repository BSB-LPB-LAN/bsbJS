import { BSBDefinition, KeyItem } from './interfaces'
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
        // /JK=ALL, JK=1,...
        res.send('get K')
    })

    app.get('/JI', (req, res) => {
        // /JI -> alle Infos
        res.send('get K')
    })

}