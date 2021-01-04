import { Value, Command } from '../interfaces'

export class Number implements Value<number> {

    public value: number | null = null
    private command: Command

    constructor(data: number[] | string | number | null, command: Command) {
        this.command = command;
        if (data instanceof Array) {

            let payload = data
            let len = command.type.payload_length & 31;
            let rawValue = 0

            // WORKAROUND: no length is defined from the command table
            // if the len is odd and no enable_byte, in most cases this should be added
            if ((payload.length == 3 || payload.length == 5) && command.type.enable_byte == 0) {
                command.type.enable_byte = 1;
            }

            if (len == 0)
                // if no enable_byte than just take length otherwise length-1
                len = payload.length - (command.type.enable_byte == 0 ? 0 : 1);

            let enabled = true;
            if (command.type.enable_byte > 0) {

                if ((payload[0] & 0x01) == 0x01)
                    enabled = false;

                payload = payload.slice(1);
            }

            if (enabled) {
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
                this.value = (rawValue / command.type.factor)
            }
            else {
                this.value = null
            }

        } else if (typeof (data) == 'number') {
            this.value = data
        } else if (typeof (data) == 'string') {
            this.value = parseInt(data, 10)
        }
    }

    public toPayload () {
        return []
    }

    public toString() {
        return this.value?.toFixed(this.command.type.precision) ?? '---'
    }
}