import { Client } from "@elastic/elasticsearch"
import { GetLocationsScoreQuery } from "./getLocationsScoreQuery"
import { LocationWithScoreDto } from "../../dtos/locationWithScoreDto"
import { LocationsScoreCalculator } from "../../domain/locationsScoreCalculator"
import { UserLocation } from "../../elastic/userLocation"
import { TimeInterval } from "../../domain/timeInterval"

export class GetLocationsScoreQueryHandler {
    constructor(private client: Client, private index: string) { }

    public async Handle(query: GetLocationsScoreQuery): Promise<LocationWithScoreDto[]> {
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
                .map((hit: any) => {
                    const matchedLocationJson = hit._source
                    return new UserLocation(
                        matchedLocationJson.timelineId,
                        matchedLocationJson.emailHash,
                        matchedLocationJson.testType,
                        new Date(matchedLocationJson.testDate),
                        matchedLocationJson.coordinates,
                        new Date(matchedLocationJson.timeFrom),
                        new Date(matchedLocationJson.timeTo))
                })
            const score = matchedLocations
                .map(matchedLocation => LocationsScoreCalculator.calculateExposureScore(
                    new TimeInterval(location.timeFrom, location.timeTo),
                    new TimeInterval(matchedLocation.timeFrom, matchedLocation.timeTo)))
                .reduce((score, current) => score + current, 0)
            locationsWithScore.push(new LocationWithScoreDto(
                location.latitude,
                location.longitude,
                location.timeFrom,
                location.timeTo,
                score))
        }

        return locationsWithScore
    }
}