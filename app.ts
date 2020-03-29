import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { Client } from "@elastic/elasticsearch"
import "./controllers/locationsController"
import { RegisterRoutes } from "./routes"
import * as swaggerUi from "swagger-ui-express"
import { Container } from "typescript-ioc"
import { AddLocationsCommandHandler } from "./locations/commands/addLocations/addLocationsCommandHandler"
import { GetLocationsScoreQueryHandler } from "./locations/queries/getLocationsScore/getLocationsScoreQueryHandler"

const env = process.env
const port = env.PORT || 8081
const elasticSearchUri = env.ELASTICSEARCH_URI || "http://localhost:9200"

const app = express()
app.use(cors())
app.use(bodyParser.json())
RegisterRoutes(app)

const elasticClient = new Client({ node: elasticSearchUri })
const locationInfoIndex = "user-location-infos"

const addLocationsCommandHandler = new AddLocationsCommandHandler(elasticClient, locationInfoIndex)
Container.bind(AddLocationsCommandHandler).factory(() => addLocationsCommandHandler)

const getLocationsScoreQueryHandler = new GetLocationsScoreQueryHandler(elasticClient, locationInfoIndex)
Container.bind(GetLocationsScoreQueryHandler).factory(() => getLocationsScoreQueryHandler)

try {
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
} catch (e) {
    console.error("Failed to create ElasticSearch index mappings", e)
}

try {
    const swaggerDoc = require("../swagger.json")
    swaggerUi.setup()
    app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDoc))
} catch (e) {
    console.error("Failed to read swagger.json", e)
}

app.listen(port, () => console.log(`Server running on port ${port}`))