import { LocationDto } from "../../dtos/locationDto"
import { ArrayNotEmpty, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class GetLocationsScoreQuery {
    @ArrayNotEmpty({ message: "at least one location must be provided" })
    @Type(() => LocationDto)
    @ValidateNested()
    readonly locations: LocationDto[]

    constructor(locations: LocationDto[]) {
        this.locations = locations
    }
}
