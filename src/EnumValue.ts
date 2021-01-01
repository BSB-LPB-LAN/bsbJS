import { Value, Command } from './interfaces' 

import { Helper } from './Helper'

export class EnumValue implements Value<number> {

    public value: number | null = null
    private command: Command

    constructor(data: number[] | string | Date, command: Command) {
        this.command = command;
        if (data instanceof Array) {

            let payload = data


            let enabled = true;
            if (command.type.enable_byte > 0) {

                if ((payload[0] & 0x01) == 0x01)
                    enabled = false;

                payload = payload.slice(1);
            }

            if (enabled) {

                if (payload.length == 1)
                    payload.unshift(0);

                let enumKey = '0x' + Helper.toHexString(payload);
                this.value = Helper.getLanguage(command.enum[enumKey]);

                enumvalue = payload[1]

                if (!this.value && (command.type.name == 'ONOFF' || command.type.name == 'YESNO' || command.type.name == 'CLOSEDOPEN' || command.type.name == 'VOLTAGEONOFF')) {
                    // for toggle options only the last bit counts try if 0xFF was wrong again with 0x01
                    payload[1] = payload[1] & 0x01;

                    enumKey = '0x' + Helper.toHexString(payload);
                    this.value = Helper.getLanguage(command.enum[enumKey]);
                }

                //if (!value)
                //    console.log(`ENUM   ${payload} - ${enumKey} `, command.enum);
                // write Missing Enum Value into Error / Warnung Stream

            } else {
                this.value = null
            }


        } else if (typeof (data) == 'number') {
            this.value = data
        } else if (typeof (data) == 'string') {
            // if number -> parseInt
            // if real string -> search in ENUM Text
            //this.value = parseInt(data, 10)
        }
    }

    public toString() {
        return this.value?.toString() ?? '---'
    }
}