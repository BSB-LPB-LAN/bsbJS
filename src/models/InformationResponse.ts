import { Description, Example, Property, Required } from "@tsed/schema";
import { Parameter } from "./ParameterRequests";

@Example({ pin: 700 })
export class Pin {

    @Required()
    @Description('The number of the pin.')
    pin!: number
}

export const InformationResponseExample: InformationResponse = {
    name: "bsbJS",
    version: "1.1.21-20200904085757",
    freeram: 999,
    uptime: 1208,
    MAC: "00:00:00:00:00:00:00",
    freespace: 0,
    bus: "BSB",
    buswritable: 1,
    busaddr: 66,
    busdest: 0,
    monitor: 0,
    verbose: 1,
    onewirebus: 7,
    onewiresensors: 0,
    dhtbus: [
      { "pin": 2 },
      { "pin": 3 }
    ],
    protectedGPIO: [
        {
            "pin": 10
        },
        {
            "pin": 11
        },
        {
            "pin": 12
        }
    ],
    averages: [
        {
            "parameter": 700
        },
        {
            "parameter": 701
        }
    ],
    logvalues: 0, // oder halt 1
    loginterval: 3600,
    logged: [
        { "parameter": 8700 },
        { "parameter": 8743 },
        { "parameter": 8314 }
    ]
}

@Example(InformationResponseExample)
export class InformationResponse {
    @Required()
    name!: string

    @Required()
    version!: string

    @Property()
    freeram?: number

    @Property()
    uptime?: number

    @Property()
    MAC?: string

    @Property()
    freespace?: number

    @Required()
    bus!: string // ENUM BSB, LPB, PPS

    @Required()
    buswritable!: number

    @Required()
    busaddr!: number

    @Required()
    busdest!: number

    @Property()
    monitor?: number

    @Property()
    verbose?: number

    @Property()
    onewirebus?: number

    @Property()
    onewiresensors?: number

    @Property()
    dhtbus?: Pin[]

    @Property()
    protectedGPIO?: Pin[]

    @Property()
    averages?: Parameter[]

    @Property()
    logvalues?: number

    @Property()
    loginterval?: number

    @Property()
    logged?: Parameter[]
}