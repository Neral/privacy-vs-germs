import { Controller, Route, Post, Body } from "tsoa"
import { LocationWithScoreDto } from "../dtos/locationWithScoreDto"
import { Inject } from "typescript-ioc"
import { AddUserTimelineCommand } from "../commands/addUserTimeline/addUserTimelineCommand"
import { AddUserTimelineCommandHandler } from "../commands/addUserTimeline/addUserTimelineCommandHandler"
import { DeleteUserTimelineDataCommandHandler } from "../commands/deleteUserTimelineData/deleteUserTimelineDataCommandHandler"
import { DeleteUserTimelineDataCommand } from "../commands/deleteUserTimelineData/deleteUserTimelineDataCommand"
import { GetLocationsScoreQuery } from "../queries/getLocationsScore/getLocationsScoreQuery"
import { GetLocationsScoreQueryHandler } from "../queries/getLocationsScore/getLocationsScoreQueryHandler"

@Route("/locations")
export class LocationsController extends Controller {
    @Inject private addUserTimelineCommandHandler!: AddUserTimelineCommandHandler
    @Inject private deleteUserTimelineDataCommandHandler!: DeleteUserTimelineDataCommandHandler
    @Inject private getLocationsScoreQueryHandler!: GetLocationsScoreQueryHandler

    @Post("/add")
    public async Add(@Body() command: AddUserTimelineCommand): Promise<void> {
        await this.addUserTimelineCommandHandler.Handle(command)
    }

    @Post("/delete")
    public async Delete(@Body() command: DeleteUserTimelineDataCommand): Promise<void> {
        await this.deleteUserTimelineDataCommandHandler.Handle(command)
    }

    @Post("/calculate-scores")
    public async Get(@Body() query: GetLocationsScoreQuery): Promise<LocationWithScoreDto[]> {
        return await this.getLocationsScoreQueryHandler.Handle(query)
    }
}