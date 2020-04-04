import { LocationDto } from "../../dtos/locationDto"
import { IsEmail, MinDate, MaxDate, IsNotEmpty, ArrayNotEmpty, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class AddUserTimelineCommand {
    @IsEmail({}, { message: "invalid email" })
    readonly email: string

    @MinDate(new Date(2020, 0), { message: "date is too old" })
    @MaxDate(new Date(), { message: "date cannot be in future" })
    readonly testDate: Date

    @IsNotEmpty({ message: "invalid test type" })
    readonly testType: string

    @ArrayNotEmpty({ message: "at least one location must be provided" })
    @Type(() => LocationDto)
    @ValidateNested()
    readonly locations: LocationDto[]

    constructor(
        email: string,
        testDate: Date,
        testType: string,
        locations: LocationDto[]) {
        this.email = email
        this.testDate = testDate
        this.testType = testType
        this.locations = locations
    }
}