import { Controller, Route, Post, Body } from "tsoa"
import { AddUserTimelineCommand } from "../commands/addUserTimeline/addUserTimelineCommand"
import { LocationWithScoreDto } from "../dtos/locationWithScoreDto"
import { GetLocationsScoreQuery } from "../queries/getLocationsScore/getLocationsScoreQuery"
import { Inject } from "typescript-ioc"
import { AddUserTimelineCommandHandler } from "../commands/addUserTimeline/addUserTimelineCommandHandler"
import { GetLocationsScoreQueryHandler } from "../queries/getLocationsScore/getLocationsScoreQueryHandler"

@Route("/locations")
export class LocationsController extends Controller {
    @Inject private addUserTimelineCommandHandler!: AddUserTimelineCommandHandler
    @Inject private getLocationsScoreQueryHandler!: GetLocationsScoreQueryHandler

    @Post("/add")
    public async Add(@Body() command: AddUserTimelineCommand): Promise<void> {
        await this.addUserTimelineCommandHandler.Handle(command)
    }

    @Post("/calculate-scores")
    public async Get(@Body() query: GetLocationsScoreQuery): Promise<LocationWithScoreDto[]> {
        return await this.getLocationsScoreQueryHandler.Handle(query)
    }
}