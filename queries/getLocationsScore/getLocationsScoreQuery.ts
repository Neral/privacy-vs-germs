import { LocationDto } from "../../dtos/locationDto"

export class GetLocationsScoreQuery {
    constructor(readonly locations: LocationDto[]) { }
}
