import { Controller, Route, Post, Body, Path, Get } from "tsoa"
import { LocationWithScoreDto } from "../dtos/locationWithScoreDto"
import { Inject } from "typescript-ioc"
import { AddUserTimelineCommand } from "../commands/addUserTimeline/addUserTimelineCommand"
import { AddUserTimelineCommandHandler } from "../commands/addUserTimeline/addUserTimelineCommandHandler"
import { DeleteUserTimelineDataCommandHandler } from "../commands/deleteUserTimelineData/deleteUserTimelineDataCommandHandler"
import { DeleteUserTimelineDataCommand } from "../commands/deleteUserTimelineData/deleteUserTimelineDataCommand"
import { GetLocationsScoreQuery } from "../queries/getLocationsScore/getLocationsScoreQuery"
import { GetLocationsScoreQueryHandler } from "../queries/getLocationsScore/getLocationsScoreQueryHandler"
import { ConfirmEmailCommandHandler } from "../commands/confirmEmail/confirmEmailCommandHandler"

@Route("/locations")
export class UserTimelineController extends Controller {
    @Inject private addUserTimelineCommandHandler!: AddUserTimelineCommandHandler
    @Inject private deleteUserTimelineDataCommandHandler!: DeleteUserTimelineDataCommandHandler
    @Inject private getLocationsScoreQueryHandler!: GetLocationsScoreQueryHandler
    @Inject private confirmEmailCommandHandler!: ConfirmEmailCommandHandler

    @Post("/add")
    public async add(@Body() command: AddUserTimelineCommand): Promise<void> {
        await this.addUserTimelineCommandHandler.Handle(command)
    }

    @Post("/delete")
    public async delete(@Body() command: DeleteUserTimelineDataCommand): Promise<void> {
        await this.deleteUserTimelineDataCommandHandler.Handle(command)
    }

    @Post("/calculate-scores")
    public async get(@Body() query: GetLocationsScoreQuery): Promise<LocationWithScoreDto[]> {
        return await this.getLocationsScoreQueryHandler.Handle(query)
    }

    @Get("/confirm/{confirmationCode}")
    public async confirm(@Path('confirmationCode') confirmationCode: string): Promise<void> {
        await this.confirmEmailCommandHandler.Handle({ confirmationCode })
    }
}