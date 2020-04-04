import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { Client } from "@elastic/elasticsearch"
import "./controllers/locationsController"
import { RegisterRoutes } from "./routes"
import * as swaggerUi from "swagger-ui-express"
import { Container, Scope } from "typescript-ioc"
import { AddUserTimelineCommandHandler } from "./commands/addUserTimeline/addUserTimelineCommandHandler"
import { DeleteUserTimelineDataCommandHandler } from "./commands/deleteUserTimelineData/deleteUserTimelineDataCommandHandler"
import { GetLocationsScoreQueryHandler } from "./queries/getLocationsScore/getLocationsScoreQueryHandler"
import { ValidationError } from "class-validator"

const env = process.env
const port = env.PORT || 8081
const elasticSearchUri = env.ELASTICSEARCH_URI || "http://localhost:9200"

const app = express()
app.use(cors())
app.use(bodyParser.json())
RegisterRoutes(app)
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    if (Array.isArray(err) && err.length && err[0] instanceof ValidationError)
        res.status(400).send(err)
    else
        res.status(500).send("Something went wrong. Please try again later.")
})

const elasticClient = new Client({ node: elasticSearchUri })
const locationsIndex = "user-locations"

Container
    .bind(AddUserTimelineCommandHandler)
    .factory(() => new AddUserTimelineCommandHandler(elasticClient, locationsIndex))
    .scope(Scope.Singleton)

Container
    .bind(DeleteUserTimelineDataCommandHandler)
    .factory(() => new DeleteUserTimelineDataCommandHandler(elasticClient, locationsIndex))
    .scope(Scope.Singleton)

Container
    .bind(GetLocationsScoreQueryHandler)
    .factory(() => new GetLocationsScoreQueryHandler(elasticClient, locationsIndex))
    .scope(Scope.Singleton)

try {
    elasticClient.indices.create({
        index: locationsIndex,
        body: {
            mappings: {
                properties: {
                    timelineId: { type: "text" },
                    emailHash: { type: "text" },
                    testType: { type: "text" },
                    testDate: { type: "date" },
                    coordinates: { type: "geo_point" },
                    timeFrom: { type: "date" },
                    timeTo: { type: "date" }
                },
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