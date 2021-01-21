import { Description, Example, Required } from "@tsed/schema";

@Example({ api_version: "2.0" })
export class ApiVersionResponse {
    
    @Required()
    @Description('Object containing API Version')
    api_version!: string

}