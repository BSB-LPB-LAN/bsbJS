import { BSBDefinition, Command, TranslateItem, Device, Value } from "./interfaces";
import { Observable, Subject } from "rxjs";
import * as net from "net";
import * as stream from "stream";
import e from "express";

import { DateTimeValue } from './DateTimeValue'
import { DayMonthValue } from './DayMonthValue'
import { TimeProgValues } from "./TimeProg";
import { HourMinuteValue } from "./HourMinuteValue";
import { StringValue } from "./StringValue";
import { NumberValue } from "./NumberValue";
import { EnumValue } from "./EnumValue";
import { BitValue } from "./BitValue";

import { Definition } from './Definition'
import { Helper } from './Helper'
import { ErrorValue } from "./ErrorValue";
import { trace } from "console";

// /* telegram addresses */
// #define ADDR_HEIZ  0x00
// #define ADDR_EM1   0x03
// #define ADDR_EM2   0x04
// #define ADDR_RGT1  0x06
// #define ADDR_RGT2  0x07
// #define ADDR_CNTR  0x08
// #define ADDR_DISP  0x0A
// #define ADDR_SRVC  0x0B
// #define ADDR_OZW   0x31
// #define ADDR_FE    0x32
// #define ADDR_RC    0x36
// #define ADDR_LAN   0x42
// #define ADDR_ALL   0x7F

export enum MSG_TYPE {
    /** request info telegram */
    QINF = 0x01,
    /** send info telegram */
    INF = 0x02,
    /** set parameter */
    SET = 0x03,
    /** acknowledge set parameter */
    ACK = 0x04,
    /** do not acknowledge set parameter */
    NACK = 0x05,
    /** query parameter */
    QUR = 0x06,
    /** answer query */
    ANS = 0x07,
    /** error */
    ERR = 0x08,
    /** query  reset value */
    QRV = 0x0F,
    /** answer reset value */
    ARV = 0x10,
    /** query reset value failed (1 byte payload of unknown meaning) */
    QRE = 0x11,
    /** internal query type 1 (still undecoded) */
    IQ1 = 0x12,
    /** internal answer type 1 (still undecoded) */
    IA1 = 0x13,
    /** internal query type 2 (still undecoded) */
    IQ2 = 0x14,
    /** internal answer type 2 (still undecoded) */
    IA2 = 0x15,
}

export interface RAWMessage {
    data: number[];
    src: number;
    dst: number;
    typ: MSG_TYPE;
    cmd: number[];
    crc: number[];
    payload: number[];
}

type busRequest = {
    timestamp?: Date
    command: Command
    data: number[]
    done: (value: busRequestAnswer) => void
    error: (reason?: any) => void
}

type busRequestAnswer = null | { 
    command: Command
    value: any
    msg: RAWMessage
}
export class BSB {

    //#region Variables & Properties
    public Log$: Observable<any>;
    private log$: Subject<any>;

    private definition: Definition
    private client: stream.Duplex | null = null

    private buffer: number[] = []

    private language: string

    private device: Device

    private src: number

    private lastReceivedData: Date = new Date(0)

    private sentQueue: busRequest[] = []
    private openRequest: busRequest | null = null
    //#endregion

    constructor(definition: Definition, device: Device, src: number = 0xC2, language: string = "KEY") {

        this.definition = definition;
        this.device = device;
        this.language = language;
        this.src = src;

        this.log$ = new Subject();
        this.Log$ = this.log$.asObservable();

        setInterval(() => this.checkSendQueue(), 10)
    }

    private checkSendQueue() {
        // ToDo check for timeout
        // if answers from the dst are already delivered,....
        if (this.openRequest?.timestamp) {
            let timeDiff = ((new Date().getTime()) - this.openRequest.timestamp.getTime()) / 1000

            // ToDo: make Timeout configurable now 5seconds
            if (timeDiff > 5) {
                this.openRequest.error('No Answer Timeout')
                this.openRequest = null
            }
        }

        if (!this.openRequest && this.sentQueue.length > 0 && this.client) {
            let newRequest = this.sentQueue.shift()
            if (newRequest) {

                this.openRequest = newRequest
                // todo move the call of the client write to a timer
                this.client.write(Uint8Array.from(newRequest.data))
            }
        }
    }


    private calcCRC(data: number[]): [number, number] {
        function crc16(crc16: number, item: number): number {

            crc16 = crc16 ^ (item << 8)

            for (let i = 0; i < 8; i++) {
                if (crc16 & 0x8000) {
                    crc16 = (crc16 << 1) ^ 0x1021
                } else {
                    crc16 <<= 1
                }
            }
            return crc16 & 0xFFFF
        }

        let crc: number = 0

        for (let i = 0; i < data.length; i++) {
            crc = crc16(crc, data[i])
        }

        return [
            (crc >> 8) & 0xFF,
            (crc >> 0) & 0xFF
        ]
    }

    private parseMessage(msg: RAWMessage) {

        if (msg.typ == MSG_TYPE.QUR || msg.typ == MSG_TYPE.SET) {
            let swap = msg.cmd[0];
            msg.cmd[0] = msg.cmd[1];
            msg.cmd[1] = swap;
        }

        let cmd = '0x' + Helper.toHexString(msg.cmd);
        let command = this.definition.findCMD(cmd, this.device);

        let value: string | object | null = null

        if (msg.typ == MSG_TYPE.QUR || msg.typ == MSG_TYPE.INF || msg.typ == MSG_TYPE.SET) {
            value = Helper.toHexString(msg.payload);
            if (value.length > 0)
                value = 'Payload: 0x' + value;
        }

        if (msg.typ == MSG_TYPE.ANS || msg.typ == MSG_TYPE.INF) {

            // add Parse of SET Messages also to the Type.from() functions
            if (command) {

                switch (command.type.datatype) {
                    case 'BITS':
                        value = new BitValue(msg.payload, command)
                        break
                    case 'ENUM':
                        value = new EnumValue(msg.payload, command)
                        break
                    case 'VALS':
                        value = new NumberValue(msg.payload, command)
                        break;
                    case 'DDMM':
                        value = new DayMonthValue(msg.payload, command)
                        break
                    case 'DTTM':
                        switch (command.type.name) {
                            case 'DATETIME':
                                value = new DateTimeValue(msg.payload, command)
                                break
                            case 'TIMEPROG':
                                value = new TimeProgValues(msg.payload, command)
                                break
                        }
                        break;
                    case 'HHMM':
                        value = new HourMinuteValue(msg.payload, command)
                        break;
                    case 'STRN':
                        value = new StringValue(msg.payload, command)
                        break;
                    case 'DWHM':
                        // ignore only PPS
                        break;
                    case 'WDAY':
                        // ignore because not used in any command
                        break
                }
            }
        }

        if (msg.typ == MSG_TYPE.ERR && command) {
            value = new ErrorValue(msg.payload)
        }

        if (msg.typ == MSG_TYPE.ANS || msg.typ == MSG_TYPE.ERR) {
            if (this.openRequest && (this.openRequest?.command.parameter === command?.parameter)) {
                this.openRequest.done({
                    msg: msg,
                    command: command,
                    value: value as object
                })
                this.openRequest = null
            }
        }
        this.log$.next(MSG_TYPE[msg.typ] + ' '
            + Helper.toHexString([msg.src])
            + ' -> ' + Helper.toHexString([msg.dst])
            + ' ' + cmd + ' ' + Helper.getLanguage(command?.description, this.language) + ' (' + command?.parameter + ') = ' + ((value ?? '---') as any).toString(this.language));
    }

    private parseBuffer() {
        let pos: number = 0;

        while (pos < this.buffer.length) {
            // BSB
            if ((pos < this.buffer.length - 4) && (this.buffer[pos] == 0xDC)) {
                let len = this.buffer[pos + 3];

                if (pos < this.buffer.length - len + 1) {
                    let newmessage = this.buffer.slice(pos, pos + len);

                    let crc = Helper.toHexString(newmessage.slice(newmessage.length - 2));
                    let crcCalculated = Helper.toHexString(this.calcCRC(newmessage.slice(0, newmessage.length - 2)));

                    if (crc == crcCalculated) {
                        let msg = {
                            data: newmessage,
                            src: newmessage[1] & 0x7F,
                            dst: newmessage[2],
                            typ: newmessage[4],
                            cmd: newmessage.slice(5, 9),
                            crc: newmessage.slice(newmessage.length - 2),
                            payload: newmessage.slice(9, newmessage.length - 2)
                        };
                        this.parseMessage(msg as any);

                        // todo if pos <> 0, send message with
                        // unprocessed data

                        this.buffer = this.buffer.slice(pos + len);

                        pos = -1;
                    }
                    else {
                        // wrong CRC ??
                    }
                }
            }
            pos++;
        }
    }

    private newData(data: number[]) {
        this.lastReceivedData = new Date()
        for (let i = 0; i < data.length; i++) {
            this.buffer.push(~data[i] & 0xFF)
        }
        this.parseBuffer()
    }

    public connect(stream: stream.Duplex): void;
    public connect(ip: string, port: number): void;
    public connect(param1: string | stream.Duplex, param2?: number) {

        try {
            this.client?.off('data', data => this.newData(data));
        } catch { }

        if (param1 instanceof stream.Duplex) {
            this.client = param1
        }
        else {
            const socket = new net.Socket()

            socket.connect(param2 ?? 0, param1, () => {
                console.log('connected');
            });
            this.client = socket
        }

        this.client.on('data', data => this.newData(data));
    }

    // rename to sentCommand, with optional value
    private sentCommand(param: number, value?: object, dst: number = 0x00): Promise<busRequestAnswer> {
        const command = this.definition.findParam(param, this.device)

        // check if command is NOT readonly if (value)

        if (command) {
            let cmd: number[] = Array.prototype.slice.call(Buffer.from(command.command.replace(/0x/g, ''), "hex"), 0)

            let len = 11
            let type = MSG_TYPE.QUR
            let payload: number[] = []

            if (value) {
                debugger // command 710 0x010540 -> 21°C
                payload = (value as any).toPayload()

                type = MSG_TYPE.SET
                len+=command.type.payload_length
            }

            if (type == MSG_TYPE.QUR || type == MSG_TYPE.SET) {
                const swap = cmd[0]
                cmd[0] = cmd[1]
                cmd[1] = swap
            }

            let data = [0xDC, this.src, dst, len, type, ...cmd, ...payload]
            data = [...data, ...this.calcCRC(data)]

            for (let i = 0; i < data.length; i++)
                data[i] = (~data[i]) & 0xFF;

            return new Promise<busRequestAnswer>((done, error) => {
                this.sentQueue.push({
                    command: command,
                    data: data,
                    done: done,
                    error: error
                })
            })
        }

        return new Promise((done) => { done(null) })
    }

    public async set (param: number, value: number | string | null, dst: number = 0x00) {

        let command = this.definition.findParam(param, this.device)

        if (command) {
            let val = new NumberValue(value, command)

            return await this.sentCommand(param, val, dst)
        }
    } 

    public async get(param: number | number[], dst: number = 0x00): Promise<any> {
        if (!Array.isArray(param)) {
            param = [param]
        }

        let queue = []
        for (let item of param) {
            queue.push(this.sentCommand(item, undefined, dst))
        }
        let resAll = await Promise.all(queue)

        let result: any = {}
        for (let res of resAll) {

            if (res) {

                let error = 0
                let value = res.value?.toString(this.language)
                let desc = ''
                if (res.value instanceof ErrorValue) {
                    error = value
                    value = ''
                }

                if (res.value instanceof EnumValue) {
                    desc = value
                    value = res.value.value
                }

                result[res.command.parameter] = {
                    name: Helper.getLanguage(res.command.description, this.language),
                    error: error,
                    value: value,
                    desc: desc,
                    dataType: res.command.type.datatype_id,
                    readonly: ((res.command.flags?.indexOf('READONLY') ?? -1) != -1) ? 1 : 0,
                    unit: Helper.getLanguage(res.command.type.unit, this.language)
                }
            }
        }
        return result
    }
}