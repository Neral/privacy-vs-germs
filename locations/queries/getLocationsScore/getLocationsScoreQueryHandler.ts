import { Client } from "@elastic/elasticsearch"
import { GetLocationsScoreQuery } from "./getLocationsScoreQuery"
import { LocationWithScoreDto } from "../../dtos/locationWithScoreDto"
import { UserLocationInfo } from "../../../domain/userLocationInfo"
import { LocationsScoreCalculator } from "../../../domain/locationsScoreCalculator"
import { Time } from "../../../domain/time"

export class GetLocationsScoreQueryHandler {
    constructor(private client: Client, private locationInfoIndex: string) { }

    public async Handle(query: GetLocationsScoreQuery): Promise<LocationWithScoreDto[]> {
        const body = []
        for (const location of query.locations) {
            body.push({}, {
                query: {
                    bool: {
                        must: {
                            geo_distance: {
                                distance: "50m",
                                coords: {
                                    lat: location.lat,
                                    lon: location.lon
                                }
                            }
                        }
                    }
                },
                size: 10000
            })
        }
        const searchResult = await this.client.msearch({ index: this.locationInfoIndex, body: body })
        const locationsWithScore = []

        for (let i = 0; i < query.locations.length; i++) {
            const location = query.locations[i]
            const userLocationInfos: UserLocationInfo[] = searchResult.body.responses[i].hits.hits.map((record: any) => record._source)
            const score = userLocationInfos
                .map(userLocationInfo => LocationsScoreCalculator.calculateLocationScore(new Time(location.from, location.to), userLocationInfo.time))
                .reduce((score, current) => score + current, 0)
            locationsWithScore.push({
                score: score,
                lat: location.lat,
                lon: location.lon,
                from: location.from,
                to: location.to
            })
        }

        return locationsWithScore
    }
}