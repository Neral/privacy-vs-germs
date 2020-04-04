import { TestType } from "../../domain/testType"
import { LocationDto } from "../../dtos/locationDto"

export class AddUserTimelineCommand {
    constructor(
        readonly email: string,
        readonly testDate: Date,
        readonly testType: TestType,
        readonly locations: LocationDto[]) { }
}