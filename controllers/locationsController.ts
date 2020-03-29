import { Controller, Route, Post, Body } from "tsoa"
import { AddLocationsCommand } from "../locations/commands/addLocations/addLocationsCommand"
import { LocationWithScoreDto } from "../locations/dtos/locationWithScoreDto"
import { GetLocationsScoreQuery } from "../locations/queries/getLocationsScore/getLocationsScoreQuery"
import { Inject } from "typescript-ioc"
import { AddLocationsCommandHandler } from "../locations/commands/addLocations/addLocationsCommandHandler"
import { GetLocationsScoreQueryHandler } from "../locations/queries/getLocationsScore/getLocationsScoreQueryHandler"

@Route("/locations")
export class LocationsController extends Controller {

    @Inject
    private addLocationsCommandHandler!: AddLocationsCommandHandler
    @Inject
    private getLocationsScoreQueryHandler!: GetLocationsScoreQueryHandler

    @Post("/add")
    public async Add(@Body() command: AddLocationsCommand): Promise<void> {
        await this.addLocationsCommandHandler.Handle(command)
    }

    @Post("/calculate-scores")
    public async Get(@Body() query: GetLocationsScoreQuery): Promise<LocationWithScoreDto[]> {
        return await this.getLocationsScoreQueryHandler.Handle(query)
    }
}