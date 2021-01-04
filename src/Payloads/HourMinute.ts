import { Value, Command } from '../interfaces'

export class HourMinute implements Value<Date> {

    public value: Date | null = null
    private command : Command

    constructor (data: number[] | string | Date  | null, command: Command ) {
        this.command = command;
        if (data instanceof Array) {
            let payload = data;
                if ((payload[0] & 0x01) != 0x01) {
                    this.value = new Date(0,0,0, payload[1], payload[2]);
                }
                else
                    this.value = null;
        } else  if (data instanceof Date)
        {
            this.value = data
        } else if (typeof(data) == 'string')
        {
            this.value = new Date(data)
        }
    }

    public toPayload () {
        return []
    }

    public toString() {
        const options = { hour: '2-digit', minute: '2-digit', seconds: undefined };

        return this.value?.toLocaleTimeString('de-DE', options) ?? '---'
    }
}