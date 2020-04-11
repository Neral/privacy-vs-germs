import { Client } from "@elastic/elasticsearch"
import { GetLocationsScoreQuery } from "./getLocationsScoreQuery"
import { LocationWithScoreDto } from "../../dtos/locationWithScoreDto"
import { LocationsScoreCalculator } from "../../domain/locationsScoreCalculator"
import { UserLocation } from "../../elastic/userLocation"
import { TimeInterval } from "../../domain/timeInterval"
import { transformAndValidate } from "class-transformer-validator"
import { plainToClass } from "class-transformer"
import { LocationIntersectionCalculator } from "../../domain/locationIntersectionCalculator"

export class GetLocationsScoreQueryHandler {
    constructor(private client: Client, private index: string) { }

    public async Handle(query: GetLocationsScoreQuery): Promise<LocationWithScoreDto[]> {
        await transformAndValidate(GetLocationsScoreQuery, query)
        const body = []
        for (const location of query.locations) {
            body.push({}, {
                query: {
                    bool: {
                        must: {
                            geo_distance: {
                                distance: "50m",
                                coordinates: [location.longitude, location.latitude]
                            }
                        }
                    }
                },
                size: 10000
            })
        }
        const searchResult = await this.client.msearch({
            index: this.index,
            body: body
        })
        const locationsWithScore = []

        for (let i = 0; i < query.locations.length; i++) {
            const location = query.locations[i]
            const matchedLocations: UserLocation[] = searchResult.body.responses[i].hits.hits
                .map((hit: any) => plainToClass(UserLocation, hit._source))
            const intersectingLocations = matchedLocations.filter(userLocation => 
                    LocationIntersectionCalculator.isIntersecting(userLocation, location)
                )
            const score = intersectingLocations
                .map(matchedLocation => LocationsScoreCalculator.calculateExposureScore(
                    // FIXME Calculate distance once before filtering
                    LocationIntersectionCalculator.distance(matchedLocation, location),
                    matchedLocation.radius,
                    new TimeInterval(location.timeFrom, location.timeTo),
                    new TimeInterval(matchedLocation.timeFrom, matchedLocation.timeTo)
                ))
                .reduce((score, current) => score + current, 0)

            locationsWithScore.push(
                new LocationWithScoreDto(
                    location.latitude,
                    location.longitude,
                    location.timeFrom,
                    location.timeTo,
                    score
                )
            )
        }
        return locationsWithScore
    }
}
