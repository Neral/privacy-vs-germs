import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { Client, RequestParams, ApiResponse } from "@elastic/elasticsearch"
import { sha256 } from 'js-sha256';

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
                        testDate: { type: "integer" }
                    }
                },
                coords: { type: "geo_point" },
                time: {
                    properties: {
                        from: { type: "integer" },
                        to: { type: "integer" }
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

interface AddLocationsCommand {
    email: string
    testDate: number
    testType: TestType
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

interface SearchLocationsQuery {
    locations: LocationDto[]
}

app.get("/locations", async (req, res) => {
    const query: SearchLocationsQuery = req.body
    const searchResult = await elasticClient.search({
        index: locationInfoIndex,
        body: {
            query: {
                bool: {
                    should: query.locations.map(location => ({
                        geo_distance: {
                            distance: "10m",
                            coords: {
                                lat: location.lat,
                                lon: location.lon
                            }
                        }
                    }))
                }
            }
        }
    })
    const locations: LocationDto[] = searchResult.body.hits.hits.map((record: any) => {
        const userLocationInfo: UserLocationInfo = record._source
        const coordinates = userLocationInfo.coords
        const time = userLocationInfo.time
        return {
            lat: coordinates.lat,
            lon: coordinates.lon,
            from: time.from,
            to: time.to
        }
    })
    res.send(locations)
})
