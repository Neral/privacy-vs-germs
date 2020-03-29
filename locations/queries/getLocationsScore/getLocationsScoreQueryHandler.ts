import { Client } from "@elastic/elasticsearch"
import { GetLocationsScoreQuery } from "./getLocationsScoreQuery"
import { LocationWithScoreDto } from "../../dtos/locationWithScoreDto"
import { UserLocationInfo } from "../../../domain/userLocationInfo"
import { LocationsScoreCalculator } from "../../../domain/locationsScoreCalculator"
import { Time } from "../../../domain/time"

export class GetLocationsScoreQueryHandler {
    constructor(private client: Client, private locationInfoIndex: string) { }

    public async Handle(query: GetLocationsScoreQuery): Promise<LocationWithScoreDto[]> {
        const locationsWithScore: LocationWithScoreDto[] = []

        for (const location of query.locations) {
            const searchResult = await this.client.search({
                index: this.locationInfoIndex,
                body: {
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
                    }
                }
            })

            const userLocationInfos: UserLocationInfo[] = searchResult.body.hits.hits.map((record: any) => record._source)
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
