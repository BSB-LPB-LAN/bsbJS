import { Value, Command, TranslateItem } from './interfaces'

import { Helper } from './Helper'

export class ErrorValue implements Value<number> {

    public value: number | null = null

    constructor(data: number[] | number) {
        if (data instanceof Array) {

            let payload = data

            switch (payload.length) {
                case 1:
                    this.value = Buffer.from(payload).readUInt8();
                    break;
                case 2:
                    this.value = Buffer.from(payload).readUInt16BE();
                    break;
                case 4:
                    this.value = Buffer.from(payload).readUInt32BE();
                    break;
            }

        } else if (typeof (data) == 'number') {
            this.value = data
        }
    }

    public toString(lang: string = 'KEY') {
        return this.value ?? 0
    }
}