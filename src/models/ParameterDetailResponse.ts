import { AdditionalProperties, ArrayOf, Description, Enum, Example, from, Integer, Required } from "@tsed/schema";

import { DataType, DataTypeDescription, TrueFalse, TrueFalseDescription } from './Enums'

export class PossibleValueEntry {
    @Required()
    @Integer()
    enumvalue!: number

    @Required()
    @Description('Translated description of the enum value')
    desc!: string
}

@Example({})
export class ParameterDetailResponseEntry  {

    @Required()
    @Description('Translated name of the parameter')
    name!: string

    @Required()
    @Description('Contains possible enum values')
    @ArrayOf(PossibleValueEntry)
    possibleValues!: PossibleValueEntry[]

    @Required()
    @Enum(TrueFalse)
    @Description('0 ... all other cases<br>1 ... ONOFF or YESNO type')
    isswitch!: boolean

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
    '700': {
      name: 'Betriebsart',
      possibleValues: [
        {
          enumValue: 0,
          desc: 'Schutzbetrieb'
        },
        {
          enumValue: 1,
          desc: 'Automatik'
        }
      ],
      isswitch: 0,
      dataType: 1,
      readonly: 0,
      unit: ''
    },
    '710': {
        name: 'Komfortsollwert',
        possibleValues: [],
        isswitch: 0,
        dataType: 0,
        readonly: 0,
        unit: '°C'
    }
  })
@AdditionalProperties(from(ParameterDetailResponseEntry))
export class ParameterDetailResponse {
    [key: string]: ParameterDetailResponseEntry
}