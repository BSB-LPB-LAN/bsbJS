import { AdditionalProperties, Description, Enum, Example, from, Required } from "@tsed/schema";

import { DataType, DataTypeDescription, SetStatus, SetStatusDescription, TrueFalse, TrueFalseDescription } from './Enums'

export class SetValueResponseEntry {
    @Required()
    @Enum(SetStatus)
    @Description(SetStatusDescription)
    status!: number
}

@Example({
    '700': {
        status: 1
    },
    '710': {
        status: 1
    }
})
@AdditionalProperties(from(SetValueResponseEntry))
export class SetValueResponse {
    [key: string]: SetValueResponseEntry
}

export class ResetValueResponseEntry {
    @Required()
    error!: number

    @Required()
    value!: string
}

@Example({
    '700': {
        error: 0,
        value: '1',
    },
    '710': {
        error: 0,
        value: '21.0',
    },
}
)
@AdditionalProperties(from(ResetValueResponseEntry))
export class ResetValueResponse {
    [key: string]: ResetValueResponseEntry
}

export const ValueResponseEntryExample700 = {
    name: 'Betriebsart',
    error: 0,
    value: '1',
    desc: 'Automatic',
    dataType: 1,
    readonly: 0,
    unit: ''
}
@Example(ValueResponseEntryExample700)
export class ValueResponseEntry extends ResetValueResponseEntry {

    @Required()
    @Description('Translated name of the parameter')
    name!: string

    @Required()
    @Description('Text representation of the value (e.g. enum)')
    desc!: string

    @Required()
    @Enum(DataType)
    @Description(DataTypeDescription)
    dataType!: number

    @Required()
    @Enum(TrueFalse)
    @Description(TrueFalseDescription)
    readonly!: number

    @Required()
    unit!: string
}

@Example({
    '700': ValueResponseEntryExample700,
    '710': {
        name: 'Komfortsollwert',
        error: 0,
        value: '22.0',
        desc: '',
        dataType: 0,
        readonly: 0,
        unit: '°C'
    },
}
)
@AdditionalProperties(from(ValueResponseEntry))
export class ValueResponse {
    [key: string]: ValueResponseEntry
}