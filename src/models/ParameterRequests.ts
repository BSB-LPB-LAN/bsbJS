import { Default, Description, Enum, Example, Maximum, Minimum, Required, } from "@tsed/schema";
import { ParameterSetRequestType } from "./Enums";


@Example({ parameter: 700 })
export class Parameter {
    
    @Required()
    @Description('The id of the parameter.')
    parameter!:	number
}

@Example({ parameter: 700, destination: 0 })
export class ParameterRequest extends Parameter {
    @Default(0)
    @Minimum(0)
    @Maximum(127)
    @Description('The DST address there the packet is sent on the Bus')
    destination!: number
}

@Example({ parameter: 700, value: "21" })
export class ParameterSetConfigRequest extends ParameterRequest {

    @Required()
    @Description('New parameter value')
    value!:string
}
@Example({ parameter: 700, type:0, value: "21" })
export class ParameterSetRequest extends ParameterSetConfigRequest {
    @Required()
    @Enum(ParameterSetRequestType)
    @Description(
        `Request *type* that is sent to the bus<br>
        <br>
        v | desc<br>
        --|-----<br>
        0 | SET message<br>
        1 | INF message<br>`
    )
    type!: ParameterSetRequestType
}
