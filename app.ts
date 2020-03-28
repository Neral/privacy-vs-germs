import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { Client, RequestParams, ApiResponse } from "@elastic/elasticsearch"

const env = process.env

const elasticClient = new Client({
    node: env.ELASTICSEARCH_URI || "http://localhost:9200"
})

const app: express.Application = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = env.PORT || 8081
app.listen(port, () => console.log(`Server running on port ${port}`))
app.get("/", (req, res, next) => res.send("Privacy Vs Germs"))

interface Location {
    coords: Coordinates
    time: Time
}

interface Time {
    from: number
    to: number
}

interface Coordinates {
    lat: number
    lon: number
}

const locationsIndex = "locations"

app.post("/locations/setup-index", async (req, res) => {
    await elasticClient.indices.create({
        index: locationsIndex,
        body: {
            mappings: {
                properties: {
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
    res.send()
})

app.post("/locations", async (req, res) => {
    const locations: Location[] = req.body
    const body = locations.flatMap(location => [{ index: { _index: locationsIndex } }, location])
    await elasticClient.bulk({ refresh: "true", body: body })
    res.send()
})

app.get("/locations", async (req, res) => {
    const locations: Location[] = req.body
    const result = await elasticClient.search({
        index: locationsIndex,
        body: {
            query: {
                bool: {
                    should: locations.map(location => {
                        const coordinates = location.coords;
                        return {
                            geo_distance: {
                                distance: "10m",
                                coordinates: {
                                    lat: coordinates.lat,
                                    lon: coordinates.lon
                                }
                            }
                        }
                    })
                }
            }
        }
    })
    const foundLocations = result.body.hits.hits.map((record: any) => record._source)
    res.send(foundLocations)
})
