import { BSBDefinition, Command, TranslateItem, Device } from "./interfaces";
import { Observable, Subject } from "rxjs";
import * as net from "net";
import * as stream from "stream";
import e from "express";


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


//#region Interfaces
export interface RAWMessage {
    data: number[];
    src: number;
    dst: number;
    typ: MSG_TYPE;
    cmd: number[];
    crc: number[];
    payload: number[];
}

interface CmdMap {
    [key: string]: Command[];
}

//#endregion
export class Definition {

    private config: BSBDefinition;

    private mapCmds: CmdMap = {};

    constructor(config: any) {
        this.config = config;

        for (let catKEY in this.config.categories) {
            let cat = this.config.categories[catKEY];
            for (let item of cat.commands) {
                let map = this.mapCmds[item.command];
                if (!this.mapCmds[item.command])
                    this.mapCmds[item.command] = [];

                this.mapCmds[item.command].push(item);
            }
        }
    }

    private findCMDs(cmd: string, dev_family: number, dev_variant: number): Command | null {
        let item = this.mapCmds[cmd];
        if (item)
            for (let entry of item) {
                for (let device of entry.device) {
                    if ((device.family == dev_family)
                        && (device.var == dev_variant))
                        return entry;
                }
            }
        return null;
    }

    public findCMD(cmd: string, device: Device): Command | null {

        let result: Command | null = null;

        // search for exact match of family and variant
        result = this.findCMDs(cmd, device.family, device.var);
        if (result) return result;

        // search for exact match of family
        result = this.findCMDs(cmd, device.family, 255);
        if (result) return result;

        // search for exact 255,255
        result = this.findCMDs(cmd, 255, 255);
        if (result) return result;

        return null;
    }

}

export class BSB {

    constructor(definition: Definition, device: Device, language: string = "KEY") {

        this.definition = definition;
        this.device = device;
        this.language = language;

        this.log$ = new Subject();
        this.Log$ = this.log$.asObservable();
    }

    public Log$: Observable<any>;
    private log$: Subject<any>;

    private definition: Definition;
    private client: stream.Duplex = new net.Socket();

    private buffer: number[] = [];

    private language: string;

    private device: Device;

    private getLanguage(langRessource: TranslateItem | undefined): string | null {

        if (!langRessource)
            return null;

        let lookup = langRessource as any;

        if (lookup.hasOwnProperty(this.language)) {
            return lookup[this.language];
        }

        if (lookup.hasOwnProperty("EN")) {
            return lookup[this.language];
        }

        if (lookup.hasOwnProperty("DE")) {
            return lookup[this.language];
        }

        if (lookup.hasOwnProperty("KEY")) {
            return lookup[this.language];
        }

        return null;
    }

    private toHexString(byteArray: number[]): string {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('').toUpperCase();
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

    private toHHMM(byteArray: number[]): string {

        if (byteArray.length != 2)
            return '--:--';

        return byteArray[0].toString().padStart(2, '0') + ':' + byteArray[1].toString().padStart(2, '0');
    }

    private parseMessage(msg: RAWMessage) {

        if (msg.typ == MSG_TYPE.QUR || msg.typ == MSG_TYPE.SET) {
            let swap = msg.cmd[0];
            msg.cmd[0] = msg.cmd[1];
            msg.cmd[1] = swap;
        }

        let cmd = '0x' + this.toHexString(msg.cmd);
        let command = this.definition.findCMD(cmd, this.device);

        let value: string | object | [] | null = null

        if (msg.typ == MSG_TYPE.QUR || msg.typ == MSG_TYPE.INF || msg.typ == MSG_TYPE.SET) {
            value = this.toHexString(msg.payload);
            if (value.length > 0)
                value = 'Payload: 0x' + value;
        }

        if (msg.typ == MSG_TYPE.ANS || msg.typ == MSG_TYPE.INF) {

            if (command?.type.name == 'DATETIME') {
                value = 'dateTIME'
                let payload = msg.payload;
                value = payload[5].toString().padStart(2, '0') + ':' + payload[6].toString().padStart(2, '0') + ':' + payload[7].toString().padStart(2, '0') + ' '
                    + payload[3].toString().padStart(2, '0') + '.' + payload[2].toString().padStart(2, '0') + '.' + (1900 + payload[1]).toString().padStart(2, '0');
            }

            if (command?.type.name == 'VACATIONPROG' || command?.type.name == 'SUMMERPERIOD') {
                let payload = msg.payload;
                if ((payload[0] & 0x01) != 0x01) {
                    value = payload[3].toString().padStart(2, '0') + '.' + payload[2].toString().padStart(2, '0') + '.';
                }
                else
                    value = null;
            }

            if (command?.type.name == 'TIMEPROG') {
                let payload = msg.payload;

                let values = [];

                for (let i = 0; i < 3; i++) {
                    // check if block is enabled
                    if ((payload.slice(4 * i)[0] & 0x80) != 0x80) {
                        let start = this.toHHMM(payload.slice(4 * i + 0, 4 * i + 2));
                        let end = this.toHHMM(payload.slice(4 * i + 2, 4 * i + 4));
                        values.push({
                            "start": start,
                            "end": end,
                            toString: () => start + '-' + end
                        });
                    }
                }

                value = values;
            }

            if (command?.type.datatype == 'VALS' || command?.type.datatype == 'ENUM') {


                let rawValue = 0;
                let payload = msg.payload;
                let len = command.type.payload_length & 31;

                // WORKAROUND: no length is defined from the command table
                if (command?.type.datatype == 'VALS') {

                    // if the len is odd and no enable_byte, in most cases this should be added
                    if ((payload.length == 3 || payload.length == 5) && command.type.enable_byte == 0) {
                        command.type.enable_byte = 1;
                    }

                    if (len == 0)
                        // if no enable_byte than just take length otherwise length-1
                        len = payload.length - (command.type.enable_byte == 0 ? 0 : 1);
                }

                let enabled = true;
                if (command.type.enable_byte > 0) {

                    if ((payload[0] & 0x01) == 0x01)
                        enabled = false;

                    payload = payload.slice(1);
                }

                if (enabled) {

                    if (command?.type.datatype == 'VALS') {
                        switch (len) {
                            case 1:
                                rawValue = Buffer.from(payload).readInt8();
                                break;
                            case 2:
                                rawValue = Buffer.from(payload).readInt16BE();
                                break;
                            case 4:
                                rawValue = Buffer.from(payload).readInt32BE();
                                break;
                        }
                        value = (rawValue / command.type.factor).toFixed(command.type.precision) + this.getLanguage(command.type.unit);;
                    }

                    if (command?.type.datatype == 'ENUM') {
                        if (payload.length == 1)
                            payload.unshift(0);

                        let enumKey = '0x' + this.toHexString(payload);
                        value = this.getLanguage(command.enum[enumKey]);

                        if (!value && (command.type.name == 'ONOFF' || command.type.name == 'YESNO' || command.type.name == 'CLOSEDOPEN' || command.type.name == 'VOLTAGEONOFF')) {
                            // for toggle options only the last bit counts try if 0xFF was wrong again with 0x01
                            payload[1] = payload[1] & 0x01;

                            enumKey = '0x' + this.toHexString(payload);
                            value = this.getLanguage(command.enum[enumKey]);
                        }

                        if (!value)
                            console.log(`ENUM   ${payload} - ${enumKey} `, command.enum);
                    }
                }
                //console.log('********' + len + ' - '+rawValue+ ' - '+value +'       - '+this.toHexString(payload));
            }
        }
        this.log$.next(MSG_TYPE[msg.typ] + ' ' + cmd + ' ' + this.getLanguage(command?.description) + ' (' + command?.parameter + ') = ' + (value ?? '---'));
        //    console.log('********' + this.toHexString(msg.data));
        //    console.log(MSG_TYPE[msg.typ] + ' ' + cmd + ' ' + this.getLanguage(command?.description) + ' (' + command?.parameter + ') = ' + (value ?? '---'));

    }


    private parseBuffer() {
        let pos: number = 0;

        while (pos < this.buffer.length) {
            // BSB
            if ((pos < this.buffer.length - 4) && (this.buffer[pos] == 0xDC)) {
                let len = this.buffer[pos + 3];

                if (pos < this.buffer.length - len + 1) {
                    let newmessage = this.buffer.slice(pos, pos + len);

                    let crc = this.toHexString(newmessage.slice(newmessage.length - 2));
                    let crcCalculated = this.toHexString(this.calcCRC(newmessage.slice(0, newmessage.length - 2)));

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

    public connect(stream: stream.Duplex): void;
    public connect(ip: string, port: number): void;
    public connect(param1: string | stream.Duplex, param2?: number) {
        if (param1 instanceof stream.Duplex) {
            this.client = param1
        }
        else {
            const socket = new net.Socket();

            socket.connect(param2 ?? 0, param1, () => {
                console.log('connected');
            });
        }

        this.client.on('data', (data) => {
            for (let i = 0; i < data.length; i++) {
                this.buffer.push(~data[i] & 0xFF);
            }
            this.parseBuffer();
        });
    }

    public async send(cmd: number, value: any, dst: number = 0x00): Promise<any> {
        //"parameter": 700,

        //"0x 2D 3D 05 74",
        //"DC C2 00 0B 06 3D 2D 05 74 9C4B"

        var buf = Buffer.from("DCC2000B063D2D05749C4B", "hex");
        for (let i = 0; i < buf.length; i++)
            buf[i] = (~buf[i]) & 0xFF;

        let arr = new Uint8Array(buf.length);

        buf.copy(arr);

        this.client.write(arr);
    }

}