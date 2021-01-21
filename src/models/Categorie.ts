import { AdditionalProperties, Description, Example, from, Integer, Required } from "@tsed/schema";

export class CategoryEntry {
    @Required()
    @Description('Translated name of the category.')
    name!: string

    @Required()
    @Integer()
    min!: number

    @Required()
    @Integer()
    max!: number
}

@Example({
    '0': {
        name: 'Uhrzeit und Datum',
        min: 0,
        max: 6
    },
    '1': {
        name: 'Bedieneinheit',
        min: 20,
        max: 70
    }
}
)
@AdditionalProperties(from(CategoryEntry))
export class Categories {
    [key: string]: CategoryEntry
}
