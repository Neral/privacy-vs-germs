import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { Client, RequestParams, ApiResponse } from "@elastic/elasticsearch"
import { sha256 } from "js-sha256"

const env = process.env

const elasticClient = new Client({
    node: env.ELASTICSEARCH_URI || "http://localhost:9200"
})
const locationInfoIndex = "user-location-infos"
elasticClient.indices.create({
    index: locationInfoIndex,
    body: {
        mappings: {
            properties: {
                userInfo: {
                    properties: {
                        emailHash: { type: "text" },
                        testType: { type: "text" },
                        testDate: { type: "date" }
                    }
                },
                coords: { type: "geo_point" },
                time: {
                    properties: {
                        from: { type: "date" },
                        to: { type: "date" }
                    }
                }
            }
        }
    }
}, { ignore: [400] })

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = env.PORT || 8081
app.listen(port, () => console.log(`Server running on port ${port}`))
app.get("/", (req, res, next) => res.send("Privacy Vs Germs"))

type TestType = "COVID1" | "COVID2"

class UserLocationInfo {
    userInfo: UserInfo
    coords: Coordinates
    time: Time

    constructor(userInfo: UserInfo, coords: Coordinates, time: Time) {
        this.userInfo = userInfo
        this.coords = coords
        this.time = time
    }
}

class UserInfo {
    emailHash: string
    testType: TestType
    testDate: number

    constructor(emailHash: string, testType: TestType, testDate: number) {
        this.emailHash = emailHash
        this.testType = testType
        this.testDate = testDate
    }
}

class Time {
    from: number
    to: number

    constructor(from: number, to: number) {
        this.from = from
        this.to = to
    }
}

class Coordinates {
    lat: number
    lon: number

    constructor(lat: number, lon: number) {
        this.lat = lat
        this.lon = lon
    }
}

interface LocationDto {
    lat: number
    lon: number
    from: number
    to: number
}

interface LocationWithScoreDto extends LocationDto {
    score: number
}

interface AddLocationsCommand {
    email: string
    testDate: number
    testType: TestType
    locations: LocationDto[]
}

interface GetLocationsScoreQuery {
    locations: LocationDto[]
}

app.post("/locations", async (req, res) => {
    const command: AddLocationsCommand = req.body
    const userLocationInfos = command.locations.map(location => {
        const emailHash = sha256(command.email)
        const userInfo = new UserInfo(emailHash, command.testType, command.testDate)
        const coordinates = new Coordinates(location.lat, location.lon)
        const time = new Time(location.from, location.to)
        return new UserLocationInfo(userInfo, coordinates, time)
    })
    const body = userLocationInfos.flatMap(userLocationInfo => [{ index: { _index: locationInfoIndex } }, userLocationInfo])
    await elasticClient.bulk({ refresh: "true", body: body })
    res.send()
})

app.get("/locations", async (req, res) => {
    const query: GetLocationsScoreQuery = req.body
    const locationsWithScore: LocationWithScoreDto[] = []
    
    for (const location of query.locations) {
        const searchResult = await elasticClient.search({
            index: locationInfoIndex,
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
            .map(userLocationInfo => calculateLocationScore(location.from, location.to, userLocationInfo.time.from, userLocationInfo.time.to))
            .reduce((score, current) => score + current, 0)

        locationsWithScore.push({
            score: score,
            lat: location.lat,
            lon: location.lon,
            from: location.from,
            to: location.to
        })
    }

    res.send(locationsWithScore)
})

function calculateLocationScore(
    location1From: number,
    location1To: number,
    location2From: number,
    location2To: number): number {
    const germsLifespanOnSurface = 360 * 60000
    const noExposure = Number.MIN_SAFE_INTEGER
    let exposureMilliseconds: number

    if (location2From <= location1From) {
        if (location2To <= location1To) {
            exposureMilliseconds = location2To - location1From
        }
        else {
            exposureMilliseconds = location1To - location1From
        }
    }
    else {
        if (location2To + germsLifespanOnSurface >= location1To) {
            if (location1To < location2From) {
                exposureMilliseconds = noExposure
            }
            else {
                exposureMilliseconds = location1To - location2From
            }
        }
        else {
            exposureMilliseconds = location2To + germsLifespanOnSurface - location2From
        }
    }

    const exposureMinutes = exposureMilliseconds / 60000

    if (exposureMinutes > 15)
        return 10

    if (exposureMinutes > 0)
        return 5

    if (exposureMinutes > -360)
        return 2

    return 0
}
