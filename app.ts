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

class Location {
    timeFrom: number
    timeTo: number
    latitude: number
    longitude: number

    constructor(
        timeFrom: number,
        timeTo: number,
        latitude: number,
        longitude: number) {
        this.timeFrom = timeFrom
        this.timeTo = timeTo
        this.latitude = latitude
        this.longitude = longitude
    }
}

app.post("/locations", (req, res) => {
    const locations: Location[] = req.body
    const body = locations.flatMap(location => [{ index: { _index: "locations" } }, location])
    elasticClient.bulk({ refresh: "true", body: body }, (err, resp) => res.send())
})